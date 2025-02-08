// pages/api/metadata.js
import sharp from 'sharp';
import ExifReader from 'exif-reader';

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

async function extractMetadata(imageBuffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    let exifData = {};

    if (metadata.exif) {
      try {
        exifData = ExifReader.load(metadata.exif);
      } catch (error) {
        console.error('Error reading EXIF data:', error);
      }
    }

    return {
      format: metadata.format,
      dimensions: {
        width: metadata.width,
        height: metadata.height,
      },
      colorInfo: {
        space: metadata.space,
        channels: metadata.channels,
        depth: metadata.depth,
        hasAlpha: metadata.hasAlpha,
      },
      imageProperties: {
        density: metadata.density,
        hasProfile: metadata.hasProfile,
        orientation: metadata.orientation,
      },
      exif: exifData,
      size: {
        bytes: metadata.size,
        formatted: formatFileSize(metadata.size)
      }
    };
  } catch (error) {
    throw new Error(`Error processing image: ${error.message}`);
  }
}

function formatFileSize(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
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

    // Fetch the image
    const imageResponse = await fetch(url);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }

    // Convert image to buffer
    const imageBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    // Extract metadata
    const metadata = await extractMetadata(buffer);

    res.status(200).json(metadata);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: 'Request failed', 
      details: error.message 
    });
  }
}
