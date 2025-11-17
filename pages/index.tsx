import { useState } from 'react';

export default function Home() {
  const [to, setTo] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function trigger(kind: 'incoming' | 'outgoing' | 'missed') {
    setStatus('Sending...');
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, templateKey: kind })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setStatus(`Sent ${kind} message to ${to}`);
    } catch (e: any) {
      setStatus(e.message);
    }
  }

  async function placeCall() {
    setStatus('Placing call...');
    try {
      const res = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setStatus(`Call initiated to ${to} (sid: ${json.sid})`);
    } catch (e: any) {
      setStatus(e.message);
    }
  }

  return (
    <main style={{ maxWidth: 680, margin: '40px auto', fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Call Auto-Messenger</h1>
      <p style={{ color: '#555', marginBottom: 24 }}>
        Send automatic SMS to callers for incoming, outgoing, and missed calls.
      </p>

      <label style={{ display: 'block', marginBottom: 8 }}>
        Phone Number (E.164):
      </label>
      <input
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="+15551234567"
        style={{ width: '100%', padding: '10px 12px', fontSize: 16, border: '1px solid #ccc', borderRadius: 6 }}
      />

      <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
        <button onClick={() => trigger('incoming')} style={btn}>Send Incoming SMS</button>
        <button onClick={() => trigger('outgoing')} style={btn}>Send Outgoing SMS</button>
        <button onClick={() => trigger('missed')} style={btn}>Send Missed Call SMS</button>
        <button onClick={placeCall} style={{...btn, background: '#4f46e5'}}>Place Outgoing Call</button>
      </div>

      {status && <p style={{ marginTop: 16, color: '#111' }}>{status}</p>}

      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>Webhook Endpoints</h2>
        <ul>
          <li><code>/api/twilio/voice/incoming</code> ? configure as Voice webhook for your Twilio number</li>
          <li><code>/api/twilio/voice/status</code> ? set as Status Callback for outbound calls</li>
          <li><code>/api/twilio/voice/answer</code> ? TwiML for answering outbound calls</li>
        </ul>
      </section>
    </main>
  );
}

const btn: React.CSSProperties = {
  background: '#0ea5e9',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  padding: '10px 14px',
  cursor: 'pointer'
};
