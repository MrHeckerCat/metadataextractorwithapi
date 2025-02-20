const path = require('path');
const ExifReader = require('exifreader');
const XMP = require('xmp-js');
const { v4: uuidv4 } = require('uuid');
const { put, del } = require('@vercel/blob');
const probe = require('probe-image-size');
const iptc = require('node-iptc');
const os = require('os');
const { writeFile, unlink } = require('fs/promises');

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

    // Extract EXIF and IPTC data using ExifReader
    const tags = await ExifReader.load(buffer, { expanded: true });
    console.log('ExifReader tags loaded');

    // Extract XMP data
    const xmp = new XMP(buffer);
    const xmpData = xmp.parse();
    console.log('XMP data parsed');

    // Helper function to safely get values
    const getValue = (obj, key, defaultValue = "N/A") => {
      try {
        if (!obj || !obj[key]) return defaultValue;
        if (obj[key].description) return obj[key].description;
        if (obj[key].value) return obj[key].value;
        return obj[key] || defaultValue;
      } catch (e) {
        return defaultValue;
      }
    };

    // Create metadata object
    const metadata = {
      File: {
        Url: url,
        FileName: path.basename(url),
        FileSize: buffer.length,
        ImageWidth: getValue(tags, 'ImageWidth'),
        ImageHeight: getValue(tags, 'ImageHeight')
      },
      EXIF: {
        Make: getValue(tags.exif, 'Make'),
        Model: getValue(tags.exif, 'Model'),
        Software: getValue(tags.exif, 'Software'),
        ImageDescription: getValue(tags.exif, 'ImageDescription'),
        Artist: getValue(tags.exif, 'Artist'),
        Copyright: getValue(tags.exif, 'Copyright')
      },
      IPTC: {
        Caption: getValue(tags.iptc, 'Caption'),
        CopyrightNotice: getValue(tags.iptc, 'CopyrightNotice'),
        Creator: getValue(tags.iptc, 'Creator'),
        Keywords: getValue(tags.iptc, 'Keywords')
      },
      XMP: {
        Creator: getValue(xmpData, 'dc:creator'),
        Rights: getValue(xmpData, 'dc:rights'),
        Title: getValue(xmpData, 'dc:title'),
        Description: getValue(xmpData, 'dc:description'),
        License: getValue(xmpData, 'xmpRights:WebStatement'),
        UsageTerms: getValue(xmpData, 'xmpRights:UsageTerms')
      }
    };

    return metadata;

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
