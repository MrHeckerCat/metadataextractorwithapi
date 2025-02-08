// pages/api/metadata.js
import { Buffer } from 'buffer';
import { ExifParser } from 'exif-parser';

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
    const imageInfo = await import('probe-image-size');
    const metadata = await imageInfo.default(imageBuffer);
    
    let exifData = {};
    
    // Try to extract EXIF data if it's a JPEG image
    if (metadata.type.toLowerCase() === 'jpg' || metadata.type.toLowerCase() === 'jpeg') {
      try {
        const parser = ExifParser.create(imageBuffer);
        const result = parser.parse();
        
        exifData = {
          tags: result.tags,
          imageSize: result.imageSize,
          thumbnailOffset: result.thumbnailOffset,
          thumbnailLength: result.thumbnailLength,
          thumbnailType: result.thumbnailType,
          app1Offset: result.app1Offset,
        };

        // Extract GPS data if available
        if (result.tags.GPSLatitude && result.tags.GPSLongitude) {
          exifData.gps = {
            latitude: result.tags.GPSLatitude,
            longitude: result.tags.GPSLongitude,
            altitude: result.tags.GPSAltitude,
            latitudeRef: result.tags.GPSLatitudeRef,
            longitudeRef: result.tags.GPSLongitudeRef,
            altitudeRef: result.tags.GPSAltitudeRef
          };
        }

        // Extract camera info if available
        if (result.tags.Make || result.tags.Model) {
          exifData.camera = {
            make: result.tags.Make,
            model: result.tags.Model,
            software: result.tags.Software,
            fNumber: result.tags.FNumber,
            exposureTime: result.tags.ExposureTime,
            ISO: result.tags.ISO,
            focalLength: result.tags.FocalLength,
            focalLengthIn35mmFormat: result.tags.FocalLengthIn35mmFormat,
            flash: result.tags.Flash
          };
        }

        // Extract date information
        if (result.tags.DateTimeOriginal || result.tags.CreateDate) {
          exifData.dates = {
            original: result.tags.DateTimeOriginal,
            created: result.tags.CreateDate,
            modified: result.tags.ModifyDate,
            digitized: result.tags.DateTimeDigitized
          };
        }
      } catch (exifError) {
        console.error('Error extracting EXIF data:', exifError);
      }
    }

    return {
      format: metadata.type,
      dimensions: {
        width: metadata.width,
        height: metadata.height,
      },
      imageProperties: {
        orientation: metadata.orientation,
        mimeType: metadata.mime,
      },
      size: {
        bytes: imageBuffer.length,
        formatted: formatFileSize(imageBuffer.length)
      },
      exif: exifData
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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, turnstileToken } = req.body;

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
