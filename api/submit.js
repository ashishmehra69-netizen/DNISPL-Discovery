// api/submit.js
const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxhcxb1eyMVayb2cjhkRZtmB7IiOwC8woafMYMm7nwvHHS7r2lCuaypNJASo8c-0P50OQ/exec";

  try {
    // Read raw body from request stream
    const rawBody = await new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => resolve(body));
      req.on('error', reject);
    });

    console.log('Raw body size:', rawBody.length);

    // Validate it's JSON
    JSON.parse(rawBody); // will throw if invalid

    // Forward to Apps Script
    const gasResponse = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: rawBody,
      redirect: 'follow'
    });

    const text = await gasResponse.text();
    console.log('GAS response preview:', text.substring(0, 200));

    let data;
    try {
      data = JSON.parse(text);
    } catch(e) {
      return res.status(200).json({
        success: false,
        error: 'Apps Script returned non-JSON: ' + text.substring(0, 300)
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error('Proxy error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
