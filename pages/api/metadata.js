export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const rapidApiKey = process.env.RAPID_API_KEY;
  const rapidApiHost = 'metadata-extractor.p.rapidapi.com';

  try {
    const response = await fetch(`https://metadata-extractor.p.rapidapi.com/?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': rapidApiHost,
      },
    });

    if (!response.ok) {
      throw new Error('Error fetching metadata');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
