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
        'X-RapidAPI-Key': process.env.RAPID_API_KEY,
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
