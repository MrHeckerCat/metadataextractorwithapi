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

    // Helper function to safely get values
    const getValue = (section, key) => {
      try {
        if (!section || !section[key]) return "N/A";
        if (section[key].description) return section[key].description;
        if (section[key].value) {
          if (Array.isArray(section[key].value)) {
            return section[key].value.join(', ');
          }
          return section[key].value;
        }
        return "N/A";
      } catch (e) {
        console.warn(`Error getting value for ${key}:`, e);
        return "N/A";
      }
    };

    // Helper function for numeric values
    const getNumValue = (section, key) => {
      try {
        if (!section || !section[key]) return 0;
        const value = section[key].value;
        if (Array.isArray(value)) return parseInt(value[0]) || 0;
        return parseInt(value) || 0;
      } catch (e) {
        console.warn(`Error getting numeric value for ${key}:`, e);
        return 0;
      }
    };

    return {
      File: {
        Url: url,
        FileName: path.basename(url),
        FileSize: buffer.length,
        ImageWidth: getNumValue(tags.file, 'ImageWidth'),
        ImageHeight: getNumValue(tags.file, 'ImageHeight'),
        BitsPerSample: getValue(tags.file, 'BitsPerSample'),
        ColorComponents: getValue(tags.file, 'ColorComponents'),
        FileType: getValue(tags.file, 'FileType'),
        Subsampling: getValue(tags.file, 'Subsampling')
      },
      EXIF: {
        ImageDescription: getValue(tags.exif, 'ImageDescription'),
        Artist: getValue(tags.exif, 'Artist'),
        Copyright: getValue(tags.exif, 'Copyright'),
        XResolution: getValue(tags.exif, 'XResolution'),
        YResolution: getValue(tags.exif, 'YResolution'),
        ResolutionUnit: getValue(tags.exif, 'ResolutionUnit'),
        YCbCrPositioning: getValue(tags.exif, 'YCbCrPositioning')
      },
      IPTC: {
        SpecialInstructions: getValue(tags.iptc, 'Special Instructions'),
        DateCreated: getValue(tags.iptc, 'Date Created'),
        TimeCreated: getValue(tags.iptc, 'Time Created'),
        Byline: getValue(tags.iptc, 'By-line'),
        Headline: getValue(tags.iptc, 'Headline'),
        Credit: getValue(tags.iptc, 'Credit'),
        CopyrightNotice: getValue(tags.iptc, 'Copyright Notice'),
        Caption: getValue(tags.iptc, 'Caption/Abstract')
      },
      XMP: {
        Creator: getValue(tags.xmp, 'creator'),
        Description: getValue(tags.xmp, 'description'),
        Rights: getValue(tags.xmp, 'rights'),
        Credit: getValue(tags.xmp, 'Credit'),
        DateCreated: getValue(tags.xmp, 'DateCreated'),
        Headline: getValue(tags.xmp, 'Headline'),
        Instructions: getValue(tags.xmp, 'Instructions'),
        CopyrightOwner: getValue(tags.xmp, 'CopyrightOwner'),
        ImageCreator: getValue(tags.xmp, 'ImageCreator'),
        Licensor: getValue(tags.xmp, 'Licensor'),
        UsageTerms: getValue(tags.xmp, 'UsageTerms'),
        WebStatement: getValue(tags.xmp, 'WebStatement')
      }
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
