import { del, list } from '@vercel/blob';

export default async function cleanup(req, res) {
  try {
    // Only allow POST requests from Vercel Cron
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify the request is from Vercel Cron
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // List all blobs
    const { blobs } = await list();

    // Calculate the timestamp for 24 hours ago
    const deleteBeforeDate = new Date();
    deleteBeforeDate.setHours(deleteBeforeDate.getHours() - 24);

    // Filter and delete old blobs
    const deletionPromises = blobs
      .filter(blob => new Date(blob.uploadedAt) < deleteBeforeDate)
      .map(blob => del(blob.url));

    // Wait for all deletions to complete
    await Promise.all(deletionPromises);

    return res.status(200).json({
      success: true,
      deletedCount: deletionPromises.length
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
