export async function sendWhatsApp(payload) {
  // payload: { to: '+9199xxxx', body: 'message text' }
  try {
    const res = await fetch('/api/send_whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.REACT_APP_WHATSAPP_API_KEY || ''
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const txt = await res.text();
      // sendWhatsApp failed
      return null;
    }
    return await res.json();
  } catch (e) {
    // sendWhatsApp error
    return null;
  }
}
