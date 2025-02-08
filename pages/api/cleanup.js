import { del, list } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

export default async function cleanup(req) {
  try {
    // Only allow POST requests from Vercel Cron
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Verify the request is from Vercel Cron
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
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

    return new Response(JSON.stringify({
      success: true,
      deletedCount: deletionPromises.length
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
