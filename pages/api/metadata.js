const path = require('path');
const { writeFile, unlink } = require('fs/promises');
const { v4: uuidv4 } = require('uuid');
const ExifReader = require('exifreader');

async function verifyTurnstileToken(token) {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return { success: false, error: 'Failed to verify CAPTCHA' };
  }
}

async function extractMetadata(buffer, url) {
  try {
    console.log('Starting metadata extraction...');

    // Use ExifReader directly on buffer
    const tags = await ExifReader.load(buffer, { expanded: true });

    // Helper functions
    const getValue = (obj, key, defaultValue = "N/A") => {
      return obj && obj[key] !== undefined ? obj[key] : defaultValue;
    };

    const getNumValue = (obj, key, defaultValue = 0) => {
      return obj && obj[key] !== undefined ? obj[key] : defaultValue;
    };

    // Create metadata object
    const metadataObject = {
      File: {
        Url: url,
        FileName: path.basename(url),
        FileSize: buffer.length,
        ImageWidth: getValue(tags, 'Image.XResolution'),
        ImageHeight: getValue(tags, 'Image.YResolution'),
      },
      EXIF: {
        Make: getValue(tags, 'Exif.Image.Make'),
        Model: getValue(tags, 'Exif.Image.Model'),
        Software: getValue(tags, 'Exif.Image.Software'),
        ModifyDate: getValue(tags, 'Exif.Image.ModifyDate'),
        Artist: getValue(tags, 'Exif.Image.Artist'),
        Copyright: getValue(tags, 'Exif.Image.Copyright'),
        ExposureTime: getValue(tags, 'Exif.Photo.ExposureTime'),
        FNumber: getNumValue(tags, 'Exif.Photo.FNumber'),
        ISO: getNumValue(tags, 'Exif.Photo.ISOSpeedRatings'),
        DateTimeOriginal: getValue(tags, 'Exif.Photo.DateTimeOriginal'),
        CreateDate: getValue(tags, 'Exif.Photo.CreateDate'),
        FocalLength: getValue(tags, 'Exif.Photo.FocalLength'),
      },
      IPTC: {
        Caption: getValue(tags, 'Iptc.Application2.Caption'),
        Keywords: getValue(tags, 'Iptc.Application2.Keywords'),
        DateCreated: getValue(tags, 'Iptc.Application2.DateCreated'),
        TimeCreated: getValue(tags, 'Iptc.Application2.TimeCreated'),
        By: getValue(tags, 'Iptc.Application2.Byline'),
        CopyrightNotice: getValue(tags, 'Iptc.Application2.Copyright'),
      },
      XMP: {
        Creator: getValue(tags, 'Xmp.dc.creator'),
        Rights: getValue(tags, 'Xmp.dc.rights'),
        Description: getValue(tags, 'Xmp.dc.description'),
        Title: getValue(tags, 'Xmp.dc.title'),
        CreateDate: getValue(tags, 'Xmp.xmp.CreateDate'),
        ModifyDate: getValue(tags, 'Xmp.xmp.ModifyDate'),
      },
      GPS: {
        Latitude: getValue(tags, 'Exif.GPSInfo.GPSLatitude'),
        Longitude: getValue(tags, 'Exif.GPSInfo.GPSLongitude'),
        Altitude: getValue(tags, 'Exif.GPSInfo.GPSAltitude'),
      }
    };

    console.log('Metadata extraction completed');
    return metadataObject;

  } catch (error) {
    console.error('Metadata extraction error:', error);
    throw error;
  }
}

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, turnstileToken } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Verify CAPTCHA
    const verification = await verifyTurnstileToken(turnstileToken);
    if (!verification.success) {
      return res.status(400).json({ error: 'Invalid CAPTCHA' });
    }

    // Fetch image
    const imageResponse = await fetch(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!imageResponse.ok) {
      return res.status(404).json({
        error: 'Request failed',
        details: `Failed to fetch image: ${imageResponse.status}`
      });
    }

    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    const metadata = await extractMetadata(buffer, url);
    return res.status(200).json(metadata);

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      error: 'Request failed',
      details: error.message
    });
  }
};

module.exports = {
  extractMetadata,
  verifyTurnstileToken,
  default: handler,
  config: {
    api: {
      bodyParser: {
        sizeLimit: '1mb',
      },
      responseLimit: false,
      maxDuration: 10
    }
  }
};
