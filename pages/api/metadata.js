const path = require('path');
const { ExifTool } = require('exiftool-vendored');
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
  let tempFilePath = null;

  try {
    // Create temp file in /tmp (works in Vercel)
    const tempFileName = `temp-${uuidv4()}${path.extname(url)}`;
    tempFilePath = path.join('/tmp', tempFileName);
    await writeFile(tempFilePath, buffer);

    console.log('Starting metadata extraction...');
    const metadata = await exiftool.read(tempFilePath, exiftoolOptions);
    console.log('Metadata extracted successfully');

    // Create metadata object
    const metadataObject = {
      File: {
        Url: url,
        FileName: path.basename(url),
        FileSize: metadata.FileSize || buffer.length,
        ImageWidth: metadata.ImageWidth || 0,
        ImageHeight: metadata.ImageHeight || 0,
        MIMEType: metadata.MIMEType || 'N/A'
      },
      EXIF: {
        Make: metadata.Make || 'N/A',
        Model: metadata.Model || 'N/A',
        Software: metadata.Software || 'N/A',
        ImageDescription: metadata.ImageDescription || 'N/A',
        Artist: metadata.Artist || 'N/A',
        Copyright: metadata.Copyright || 'N/A'
      },
      IPTC: {
        Caption: metadata.Caption || 'N/A',
        CopyrightNotice: metadata.CopyrightNotice || 'N/A',
        Creator: metadata.Creator || 'N/A',
        Keywords: metadata.Keywords || 'N/A'
      },
      XMP: {
        Creator: metadata.Creator || 'N/A',
        Rights: metadata.Rights || 'N/A',
        Title: metadata.Title || 'N/A',
        Description: metadata.Description || 'N/A',
        License: metadata.WebStatement || 'N/A',
        UsageTerms: metadata.UsageTerms || 'N/A'
      }
    };

    return metadataObject;

  } catch (error) {
    console.error('Metadata extraction error:', error);
    throw error;
  } finally {
    // Cleanup
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
        console.log('Temporary file cleaned up');
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
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
  } finally {
    // Ensure ExifTool process is ended
    try {
      await exiftool.end();
      console.log('ExifTool process ended');
    } catch (error) {
      console.error('Error ending ExifTool:', error);
    }
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
      maxDuration: 25 // Increased to match ExifTool timeout
    }
  }
};
