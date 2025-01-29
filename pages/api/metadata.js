// pages/api/metadata.js

async function verifyTurnstileToken(token) {
  try {
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
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return { success: false, error: 'Failed to verify CAPTCHA' };
  }
}

export default async function handler(req, res) {
  // Check method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract URL and turnstile token from request body
  const { url, turnstileToken } = req.body;

  // Validate required fields
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  if (!turnstileToken) {
    return res.status(400).json({ error: 'CAPTCHA token is required' });
  }

  try {
    // Verify CAPTCHA first
    const verification = await verifyTurnstileToken(turnstileToken);
    if (!verification.success) {
      return res.status(400).json({ 
        error: 'Invalid CAPTCHA', 
        details: verification.error || 'CAPTCHA verification failed'
      });
    }

    // If CAPTCHA is valid, proceed with metadata extraction
    const response = await fetch(
      `https://metadata-extractor.p.rapidapi.com/?url=${encodeURIComponent(url)}`, 
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': '4da17a7022msh495ad0a68eb0428p13ecb3jsn314cfa75b62c',
          'X-RapidAPI-Host': 'metadata-extractor.p.rapidapi.com'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: 'Request failed', 
      details: error.message 
    });
  }
}
