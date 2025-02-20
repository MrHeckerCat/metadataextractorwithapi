const path = require('path');
const { exiftool } = require('exiftool-vendored');

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
    console.log('Starting metadata extraction...');

    // Create temp file in /tmp (works in Vercel)
    const tempFileName = `temp-${Date.now()}.jpg`;
    tempFilePath = path.join('/tmp', tempFileName);
    require('fs').writeFileSync(tempFilePath, buffer);

    // Extract metadata
    const metadata = await exiftool.read(tempFilePath);
    console.log('Metadata extracted successfully');

    return {
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
        ModifyDate: metadata.ModifyDate || 'N/A',
        DateTimeOriginal: metadata.DateTimeOriginal || 'N/A',
        CreateDate: metadata.CreateDate || 'N/A',
        ImageDescription: metadata.ImageDescription || 'N/A',
        Artist: metadata.Artist || 'N/A',
        Copyright: metadata.Copyright || 'N/A',
        ExposureTime: metadata.ExposureTime || 'N/A',
        FNumber: metadata.FNumber || 'N/A',
        ISO: metadata.ISO || 'N/A',
        FocalLength: metadata.FocalLength || 'N/A'
      },
      IPTC: {
        Caption: metadata.Caption || 'N/A',
        Headline: metadata.Headline || 'N/A',
        Keywords: metadata.Keywords || 'N/A',
        CopyrightNotice: metadata.CopyrightNotice || 'N/A',
        Creator: metadata.Creator || 'N/A',
        DateCreated: metadata.DateCreated || 'N/A'
      },
      XMP: {
        Creator: metadata['XMP:Creator'] || 'N/A',
        Rights: metadata['XMP:Rights'] || 'N/A',
        Title: metadata['XMP:Title'] || 'N/A',
        Description: metadata['XMP:Description'] || 'N/A',
        License: metadata['XMP:License'] || 'N/A',
        UsageTerms: metadata['XMP:UsageTerms'] || 'N/A'
      }
    };
  } catch (error) {
    console.error('Metadata extraction error:', error);
    throw error;
  } finally {
    // Cleanup temp file
    if (tempFilePath) {
      try {
        require('fs').unlinkSync(tempFilePath);
        console.log('Temporary file cleaned up');
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
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
    return res.status(500).json({
      error: 'Request failed',
      details: error.message
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: false,
    maxDuration: 20 // Increased to handle ExifTool processing
  }
};
