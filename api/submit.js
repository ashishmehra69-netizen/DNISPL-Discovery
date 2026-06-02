// api/submit.js — Vercel serverless function
// Place this file at: api/submit.js in your Vercel project root
// This runs SERVER-SIDE so no CORS issues with Apps Script

export default async function handler(req, res) {
  // Allow POST only
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxhcxb1eyMVayb2cjhkRZtmB7IiOwC8woafMYMm7nwvHHS7r2lCuaypNJASo8c-0P50OQ/exec";

  try {
    // Forward the body as-is to Apps Script
    const body = JSON.stringify(req.body);

    const gasResponse = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: body,
      redirect: 'follow'
    });

    const text = await gasResponse.text();

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch(e) {
      // Apps Script returned non-JSON (shouldn't happen with our Code.gs)
      return res.status(200).json({ success: false, error: 'Apps Script returned unexpected response: ' + text.substring(0, 200) });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
