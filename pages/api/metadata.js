const path = require('path');
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
    const tags = await ExifReader.load(buffer);
    console.log('Tags loaded, structure:', Object.keys(tags));

    // Helper function to get tag info
    const getTagInfo = (section, key) => {
      try {
        if (!section || !section[key]) return null;
        const tag = section[key];
        return {
          id: tag.id,
          value: tag.value,
          description: tag.description,
          rawValue: Array.isArray(tag.value) ? tag.value : [tag.value]
        };
      } catch (e) {
        console.warn(`Error getting tag info for ${key}:`, e);
        return null;
      }
    };

    // Process each section
    const processSection = (section, keys) => {
      const result = {};
      if (!section) return result;

      // Get all keys from the section if none provided
      const tagsToProcess = keys || Object.keys(section);

      for (const key of tagsToProcess) {
        const tagInfo = getTagInfo(section, key);
        if (tagInfo) {
          result[key] = tagInfo;
        }
      }
      return result;
    };

    return {
      File: {
        Url: url,
        FileName: path.basename(url),
        FileSize: buffer.length,
        ...processSection(tags.file, [
          'Bits Per Sample',
          'Image Height',
          'Image Width',
          'Color Components',
          'Subsampling',
          'FileType'
        ])
      },
      EXIF: processSection(tags.exif),
      IPTC: processSection(tags.iptc),
      XMP: processSection(tags.xmp)
    };

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
