import { del, list } from '@vercel/blob';

export default async function cleanup(req, res) {
  try {
    console.log('Request received');
    console.log('Request headers:', JSON.stringify(req.headers));
    console.log('CRON_SECRET exists:', !!process.env.CRON_SECRET);

    // Check for Vercel's internal cron header
    const isVercelCron = req.headers['x-vercel-cron'] === 'true';
    const hasValidAuth = req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;

    console.log('Is Vercel cron:', isVercelCron);
    console.log('Has valid auth:', hasValidAuth);

    // Accept either valid auth or Vercel's internal cron header
    if (!isVercelCron && !hasValidAuth) {
      console.log('Authentication failed');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // List all blobs
    console.log('Fetching blob list...');
    const { blobs } = await list();
    console.log('Total blobs found:', blobs.length);

    // Calculate the timestamp for 12 hours ago
    const deleteBeforeDate = new Date();
    deleteBeforeDate.setHours(deleteBeforeDate.getHours() - 12);
    console.log('Delete before:', deleteBeforeDate);

    // Filter and delete old blobs
    const blobsToDelete = blobs.filter(blob => {
      const uploadDate = new Date(blob.uploadedAt);
      console.log('Blob:', blob.url, 'uploaded at:', uploadDate);
      return uploadDate < deleteBeforeDate;
    });

    console.log('Blobs to delete:', blobsToDelete.length);

    if (blobsToDelete.length > 0) {
      const deletionPromises = blobsToDelete.map(async blob => {
        try {
          console.log('Attempting to delete:', blob.url);
          await del(blob.url);
          console.log('Successfully deleted:', blob.url);
          return { success: true, url: blob.url };
        } catch (error) {
          console.error('Failed to delete blob:', blob.url, error);
          return { success: false, url: blob.url, error: error.message };
        }
      });

      const results = await Promise.all(deletionPromises);
      console.log('Deletion results:', results);

      return res.status(200).json({
        success: true,
        deletedCount: results.filter(r => r.success).length,
        results
      });
    }

    return res.status(200).json({
      success: true,
      deletedCount: 0,
      message: 'No blobs found to delete'
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
