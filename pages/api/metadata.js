const { exiftool } = require('exiftool-vendored');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { put, del } = require('@vercel/blob');
const ExifReader = require('exifreader');
const probe = require('probe-image-size');
const iptc = require('node-iptc');
const os = require('os');
const { writeFile, unlink } = require('fs/promises');

// Initialize ExifTool with a single instance
const exiftoolProcess = exiftool;

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
    // Create temp file with minimal options
    const tempFileName = `temp-${uuidv4()}${path.extname(url)}`;
    tempFilePath = path.join('/tmp', tempFileName);
    await writeFile(tempFilePath, buffer);

    // Minimal ExifTool options for faster processing
    const exiftoolOptions = [
      '-fast',
      '-fast2',
      '-json',
      '-n', // Return numeric values
      '-S', // Very short output
      '-FileSize',
      '-ImageSize',
      '-ImageDescription',
      '-Artist',
      '-Copyright',
      '-XMP:Creator',
      '-XMP:Rights',
      '-IPTC:Caption',
      '-IPTC:CopyrightNotice'
    ];

    // Set a shorter timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Metadata extraction timeout')), 15000);
    });

    // Extract metadata with timeout
    const metadata = await Promise.race([
      exiftoolProcess.read(tempFilePath, exiftoolOptions),
      timeoutPromise
    ]);

    // Create minimal metadata object
    return {
      File: {
        Url: url,
        FileName: path.basename(url),
        FileSize: metadata.FileSize || 0,
        ImageWidth: metadata.ImageWidth || 0,
        ImageHeight: metadata.ImageHeight || 0
      },
      EXIF: {
        ImageDescription: metadata.ImageDescription || 'N/A',
        Artist: metadata.Artist || 'N/A',
        Copyright: metadata.Copyright || 'N/A'
      },
      IPTC: {
        Caption: metadata.Caption || 'N/A',
        CopyrightNotice: metadata.CopyrightNotice || 'N/A'
      },
      XMP: {
        Creator: metadata.Creator || 'N/A',
        Rights: metadata.Rights || 'N/A'
      }
    };

  } catch (error) {
    console.error('Metadata extraction error:', error);
    throw error;
  } finally {
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
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

    // Quick CAPTCHA check
    const verification = await verifyTurnstileToken(turnstileToken);
    if (!verification.success) {
      return res.status(400).json({ error: 'Invalid CAPTCHA' });
    }

    // Fast image fetch
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
      maxDuration: 20
    }
  }
};
