const { exiftool } = require('exiftool-vendored');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { put, del } = require('@vercel/blob');
const ExifReader = require('exifreader');
const probe = require('probe-image-size');
const iptc = require('node-iptc');
const os = require('os');
const { writeFile, unlink } = require('fs/promises');

// Initialize ExifTool
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
  let blobUrl = null;

  try {
    console.log('Uploading to Vercel Blob...');
    const filename = `temp-${uuidv4()}${path.extname(url)}`;

    // Upload to Vercel Blob
    const { url: tempUrl } = await put(filename, buffer, {
      access: 'public',
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: 'image/jpeg',
      cacheControl: 'no-store'
    });

    blobUrl = tempUrl;
    console.log('File uploaded to:', blobUrl);

    // Download the blob
    const blobResponse = await fetch(blobUrl);
    if (!blobResponse.ok) {
      throw new Error('Failed to download blob');
    }
    const blobBuffer = Buffer.from(await blobResponse.arrayBuffer());

    // ExifTool options
    const exiftoolOptions = [
      '-fast',
      '-fast2',
      '-json',
      '-charset', 'filename=utf8',
      '-ignoreMinorErrors',
      '-FileSize',
      '-ImageSize',
      '-ImageDescription',
      '-Artist',
      '-Copyright',
      '-XMP:all',
      '-IPTC:all',
      '-ExifIFD:all',
      '-GPS:all'
    ];

    console.log('Starting metadata extraction...');
    const metadata = await exiftoolProcess.read(blobBuffer, exiftoolOptions);
    console.log('Raw metadata:', metadata);

    const metadataObject = {
      File: {
        Url: url,
        FileName: path.basename(url),
        FileSize: metadata.FileSize || 0,
        ImageWidth: metadata.ImageWidth || 0,
        ImageHeight: metadata.ImageHeight || 0,
        FileType: metadata.FileType || 'N/A',
        MIMEType: metadata.MIMEType || 'N/A'
      },
      EXIF: {
        ImageDescription: metadata.ImageDescription || 'N/A',
        Artist: metadata.Artist || 'N/A',
        Copyright: metadata.Copyright || 'N/A',
        ModifyDate: metadata.ModifyDate || 'N/A',
        CreateDate: metadata.CreateDate || 'N/A',
        DateTimeOriginal: metadata.DateTimeOriginal || 'N/A'
      },
      IPTC: {
        Caption: metadata.Caption || 'N/A',
        Headline: metadata.Headline || 'N/A',
        Keywords: metadata.Keywords || 'N/A',
        Credit: metadata.Credit || 'N/A',
        CopyrightNotice: metadata.CopyrightNotice || 'N/A',
        'By-line': metadata['By-line'] || 'N/A'
      },
      XMP: {
        Creator: metadata.Creator || 'N/A',
        Rights: metadata.Rights || 'N/A',
        Title: metadata.Title || 'N/A',
        Description: metadata.Description || 'N/A',
        UsageTerms: metadata.UsageTerms || 'N/A',
        WebStatement: metadata.WebStatement || 'N/A',
        LicensorURL: metadata.LicensorURL || 'N/A'
      }
    };

    return metadataObject;

  } catch (error) {
    console.error('Metadata extraction error:', error);
    throw error;
  } finally {
    if (blobUrl) {
      try {
        await del(blobUrl);
        console.log('Blob deleted:', blobUrl);
      } catch (error) {
        console.error('Blob deletion error:', error);
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
