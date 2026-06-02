// api/submit.js
// Vercel serverless proxy — forwards to Apps Script server-side (no CORS)

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxhcxb1eyMVayb2cjhkRZtmB7IiOwC8woafMYMm7nwvHHS7r2lCuaypNJASo8c-0P50OQ/exec";

  try {
    const body = JSON.stringify(req.body);
    console.log('Forwarding to Apps Script, payload size:', body.length);

    const gasResponse = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: body,
      redirect: 'follow'
    });

    const text = await gasResponse.text();
    console.log('Apps Script response:', text.substring(0, 300));

    let data;
    try {
      data = JSON.parse(text);
    } catch(e) {
      return res.status(200).json({
        success: false,
        error: 'Apps Script response was not JSON: ' + text.substring(0, 200)
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error('Proxy error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
