import React, { useEffect, useState } from 'react';
import { supabase } from '../shared/utils/supabaseClient';
import Header from '../shared/components/Header';
import { Link, useNavigate } from 'react-router-dom';

export default function Notifications() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);
  const pageSize = 12;
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPage(page);
  }, [page]);

  // realtime subscription to keep the list updated
  useEffect(() => {
    let channel;
    let mounted = true;

    const setup = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const uid = session.user.id;
      const phone = session.user.user_metadata?.phone || null;

      channel = supabase.channel('notifications_page')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notification_logs' }, (payload) => {
          const row = payload.new;
          if (!row) return;
          if (row.recipient_id === uid || (phone && row.recipient_phone === phone)) {
            if (!mounted) return;
            setNotifications(prev => [row, ...(prev || [])]);
            setTotal(t => t + 1);
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notification_logs' }, (payload) => {
          const row = payload.new;
          if (!row) return;
          if (row.recipient_id === uid || (phone && row.recipient_phone === phone)) {
            setNotifications(prev => (prev || []).map(n => n.id === row.id ? row : n));
          }
        })
        .subscribe();
    };

    setup();

    return () => {
      mounted = false;
      if (channel) channel.unsubscribe();
    };
  }, []);

  async function fetchPage(pg = 0) {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); return; }

      // profile id is session.user.id in this app
      const uid = session.user.id;
      const phone = session.user.user_metadata?.phone || null;

      // count
      let countQuery;
      if (phone) countQuery = supabase.from('notification_logs').select('id', { count: 'exact', head: true }).or(`recipient_id.eq.${uid},recipient_phone.eq.${phone}`);
      else countQuery = supabase.from('notification_logs').select('id', { count: 'exact', head: true }).eq('recipient_id', uid);
      const { count } = await countQuery;
      setTotal(count || 0);

      const from = pg * pageSize;
      const to = from + pageSize - 1;

      let q;
      if (phone) q = supabase.from('notification_logs').select('*').or(`recipient_id.eq.${uid},recipient_phone.eq.${phone}`);
      else q = supabase.from('notification_logs').select('*').eq('recipient_id', uid);

      const { data, error } = await q.order('created_at', { ascending: false }).range(from, to);
      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      // Fetch notifications error
    } finally {
      setLoading(false);
    }
  }

  const markRead = async (id) => {
    try {
      await supabase.from('notification_logs').update({ delivery_status: 'read' }).eq('id', id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, delivery_status: 'read' } : n));
    } catch (e) { /* mark read failed */ }
  };

  const markAllRead = async () => {
    try {
      const ids = notifications.filter(n => n.delivery_status !== 'read').map(n => n.id);
      if (ids.length === 0) return;
      await supabase.from('notification_logs').update({ delivery_status: 'read' }).in('id', ids);
      setNotifications(prev => prev.map(n => ({ ...n, delivery_status: 'read' })));
    } catch (e) { /* mark all read failed */ }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen p-6 bg-slate-50">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border">
          <div className="p-4 flex justify-between items-center border-b">
            <h2 className="font-black">Notifications</h2>
            <div className="flex items-center gap-2">
              <button onClick={markAllRead} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Mark all read</button>
              <Link to="/dashboard" className="text-xs text-slate-500">Back</Link>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-center p-8">Loading...</div>
            ) : (
              <>
                {notifications.length === 0 ? (
                  <div className="text-center p-8 text-slate-500">No notifications</div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-3 rounded-xl border ${n.delivery_status !== 'read' ? 'bg-amber-50' : 'bg-white'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-bold">{(n.payload && (n.payload.message || n.payload.text)) || n.template_key || n.title || 'Notification'}</div>
                            <div className="text-xs text-slate-500 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {n.delivery_status !== 'read' ? (
                              <button onClick={() => markRead(n.id)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Mark read</button>
                            ) : (
                              <span className="text-xs text-slate-400">Read</span>
                            )}
                            <Link to={`/tuition/${n.tuition_id}`} className="text-xs text-slate-500">Open</Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex justify-between items-center">
                  <div className="text-xs text-slate-500">Total: {total}</div>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 border rounded">Prev</button>
                    <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * pageSize >= total} className="px-3 py-1 border rounded">Next</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
