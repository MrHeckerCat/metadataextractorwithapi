const path = require('path');
const ExifReader = require('exifreader');
const { v4: uuidv4 } = require('uuid');
const { put, del } = require('@vercel/blob');
const probe = require('probe-image-size');
const iptc = require('node-iptc');
const os = require('os');
const { writeFile, unlink } = require('fs/promises');

// Initialize ExifTool with custom settings
const exiftool = new ExifTool({
  taskTimeoutMillis: 20000, // 20 seconds timeout
  maxTasksPerProcess: 1,    // Limit concurrent tasks
  minDelayBetweenSpawns: 100, // Add delay between spawns
  maxProcs: 1,             // Limit to single process
  enableHeapUsageLimit: true, // Enable memory limits
  maxHeapUsagePercent: 50  // Limit memory usage
});

// ExifTool options for faster processing
const exiftoolOptions = [
  '-json',
  '-fast',
  '-charset', 'filename=utf8',
  '-FileSize',
  '-ImageSize',
  '-ImageDescription',
  '-Artist',
  '-Copyright',
  '-XMP:all',
  '-IPTC:all',
  '-ExifIFD:all'
];

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

    // Load tags with expanded data
    const tags = await ExifReader.load(buffer, { expanded: true });
    console.log('Tags loaded successfully');

    // Helper function to safely get values
    const getValue = (obj, key, defaultValue = "N/A") => {
      try {
        if (!obj || !obj[key]) return defaultValue;
        if (obj[key].description) return obj[key].description;
        if (obj[key].value) return obj[key].value;
        if (Array.isArray(obj[key])) return obj[key].join(', ');
        return String(obj[key]) || defaultValue;
      } catch (e) {
        return defaultValue;
      }
    };

    // Helper function for numeric values
    const getNumValue = (obj, key, defaultValue = 0) => {
      try {
        const value = getValue(obj, key, null);
        if (value === null) return defaultValue;
        const num = parseFloat(value);
        return isNaN(num) ? defaultValue : num;
      } catch (e) {
        return defaultValue;
      }
    };

    // Create metadata object
    const metadataObject = {
      File: {
        Url: url,
        FileName: path.basename(url),
        FileSize: buffer.length,
        ImageWidth: getNumValue(tags.file, 'ImageWidth'),
        ImageHeight: getNumValue(tags.file, 'ImageHeight'),
        MIMEType: getValue(tags.file, 'MIMEType')
      },
      EXIF: {
        Make: getValue(tags.exif, 'Make'),
        Model: getValue(tags.exif, 'Model'),
        Software: getValue(tags.exif, 'Software'),
        ModifyDate: getValue(tags.exif, 'ModifyDate'),
        DateTimeOriginal: getValue(tags.exif, 'DateTimeOriginal'),
        CreateDate: getValue(tags.exif, 'CreateDate'),
        ImageDescription: getValue(tags.exif, 'ImageDescription'),
        Artist: getValue(tags.exif, 'Artist'),
        Copyright: getValue(tags.exif, 'Copyright'),
        ExposureTime: getValue(tags.exif, 'ExposureTime'),
        FNumber: getValue(tags.exif, 'FNumber'),
        ISO: getValue(tags.exif, 'ISO'),
        FocalLength: getValue(tags.exif, 'FocalLength')
      },
      IPTC: {
        Caption: getValue(tags.iptc, 'Caption'),
        Headline: getValue(tags.iptc, 'Headline'),
        Keywords: getValue(tags.iptc, 'Keywords'),
        CopyrightNotice: getValue(tags.iptc, 'CopyrightNotice'),
        Creator: getValue(tags.iptc, 'Creator'),
        DateCreated: getValue(tags.iptc, 'DateCreated')
      },
      XMP: {
        Creator: getValue(tags.xmp, 'Creator'),
        Rights: getValue(tags.xmp, 'Rights'),
        Title: getValue(tags.xmp, 'Title'),
        Description: getValue(tags.xmp, 'Description'),
        License: getValue(tags.xmp, 'WebStatement'),
        UsageTerms: getValue(tags.xmp, 'UsageTerms')
      }
    };

    console.log('Metadata extraction completed');
    return metadataObject;

  } catch (error) {
    console.error('Metadata extraction error:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
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

    // Fetch image with timeout
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
    const isTimeout = error.message.includes('timeout');
    return res.status(isTimeout ? 408 : 500).json({
      error: 'Request failed',
      details: error.message
    });
  } finally {
    // Ensure ExifTool process is ended
    try {
      await exiftool.end();
      console.log('ExifTool process ended');
    } catch (error) {
      console.error('Error ending ExifTool:', error);
    }
  }
}

// API configuration
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: false,
    maxDuration: 10
  }
};
