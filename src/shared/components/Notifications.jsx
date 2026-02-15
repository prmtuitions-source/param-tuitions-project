import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import logger from '../utils/logger';

export default function Notifications({ role = 'admin', pollInterval = 0 }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const mounted = useRef(true);
  const toastTimer = useRef(null);

  useEffect(() => () => { mounted.current = false; }, []);

  const fetchNotes = async () => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_role', role)
        .order('created_at', { ascending: false })
        .limit(20);
      if (mounted.current) setItems(data || []);
    } catch (err) {
      logger.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotes();

    // Realtime subscription for new notifications
    const subscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        if (!payload?.new) return;
        if (payload.new.recipient_role === role) {
          setItems(prev => [payload.new, ...prev]);
          // show transient toast
          const note = { title: payload.new.title || 'Notification', message: payload.new.message };
          setToast(note);
          // play short beep via WebAudio
          try {
            const AudioContext = (typeof globalThis !== 'undefined' && (globalThis.AudioContext || globalThis.webkitAudioContext)) || null;
            if (AudioContext) {
              const ctx = new AudioContext();
              const o = ctx.createOscillator();
              const g = ctx.createGain();
              o.type = 'sine';
              o.frequency.setValueAtTime(880, ctx.currentTime);
              g.gain.setValueAtTime(0.0001, ctx.currentTime);
              g.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.01);
              o.connect(g); g.connect(ctx.destination);
              o.start();
              setTimeout(() => { o.stop(); ctx.close(); }, 250);
            }
          } catch (e) { /* ignore audio errors */ }

          // show desktop notification if permission granted/requested
          try {
            if (typeof globalThis !== 'undefined' && 'Notification' in globalThis) {
              if (Notification.permission === 'granted') {
                const n = new Notification(note.title, { body: note.message });
                n.onclick = () => { if (typeof globalThis.focus === 'function') globalThis.focus(); };
              } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(p => {
                  if (p === 'granted') {
                    const n = new Notification(note.title, { body: note.message });
                    n.onclick = () => { if (typeof globalThis.focus === 'function') globalThis.focus(); };
                  }
                });
              }
            }
          } catch (e) { /* ignore */ }

          if (toastTimer.current) clearTimeout(toastTimer.current);
          toastTimer.current = setTimeout(() => setToast(null), 5000);
        }
      })
      .subscribe();

    let pollId = null;
    if (pollInterval > 0) {
      pollId = setInterval(fetchNotes, pollInterval);
    }

    return () => {
      if (subscription) supabase.removeChannel(subscription);
      if (pollId) clearInterval(pollId);
    };
  }, [role]);

  const markAsRead = async (id) => {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      logger.error('Failed to mark notification read', err);
    }
  };

  const unreadCount = items.filter(i => !i.is_read).length;

  return (
    <div className="relative">
      <button onClick={() => { setOpen(o => !o); if (!open) fetchNotes(); }} className="relative p-2 rounded hover:bg-slate-100">
        <i className="fas fa-bell text-xl"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded shadow-lg z-50">
          <div className="p-3 border-b font-bold">Notifications</div>
          <div className="max-h-64 overflow-y-auto">
            {items.length === 0 && <div className="p-3 text-sm text-slate-500">No recent notifications</div>}
            {items.map(n => (
              <div key={n.id} className="p-3 hover:bg-slate-50 flex justify-between items-start gap-3">
                <div>
                  <div className="font-semibold text-sm">{n.title || 'Notification'}</div>
                  <div className="text-xs text-slate-600 mt-1">{n.message}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                </div>
                <div className="flex flex-col items-end">
                  <button onClick={() => markAsRead(n.id)} className="text-[11px] text-blue-600 underline">Mark read</button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-2 border-t text-center">
            <button onClick={() => { setItems([]); }} className="text-xs text-slate-500">Clear list</button>
          </div>
        </div>
      )}
    </div>
  );
}

