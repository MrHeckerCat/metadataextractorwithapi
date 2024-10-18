import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filename = req.headers['x-vercel-filename'] || 'uploaded-file';
    
    const blob = await put(filename, req, {
      access: 'public',
    });

    res.status(200).json(blob);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}
