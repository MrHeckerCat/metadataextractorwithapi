const express = require('express');
const app = express();

async function verifyTurnstileToken(token) {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secret: '0x4AAAAAAA6sKyP7fuZYrlRwvvZA4jVc2wM',
      response: token,
    }),
  });

  return await response.json();
}

app.post('/api/metadata', async (req, res) => {
  const { turnstileToken } = req.body;

  // Verify the token
  const verification = await verifyTurnstileToken(turnstileToken);

  if (!verification.success) {
    return res.status(400).json({ error: 'Invalid CAPTCHA' });
  }





export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const response = await fetch(`https://metadata-extractor.p.rapidapi.com/?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': '4da17a7022msh495ad0a68eb0428p13ecb3jsn314cfa75b62c',
        'X-RapidAPI-Host': 'metadata-extractor.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Metadata extraction error:', error);
    res.status(500).json({ error: 'Failed to extract metadata', details: error.message });
  }
}
