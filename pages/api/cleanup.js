import { del, list } from '@vercel/blob';

export default async function cleanup(req, res) {
  try {
    // Log request method and headers for debugging
    console.log('Request method:', req.method);
    console.log('Authorization header:', req.headers.authorization ? 'Present' : 'Missing');

    // Only allow POST requests from Vercel Cron
    if (req.method !== 'POST') {
      console.log('Method not allowed:', req.method);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify the request is from Vercel Cron
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('Invalid authorization');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // List all blobs
    console.log('Fetching blob list...');
    const { blobs } = await list();
    console.log('Total blobs found:', blobs.length);

    // Calculate the timestamp for 24 hours ago
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
