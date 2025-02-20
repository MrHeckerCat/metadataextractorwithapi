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

    // Load tags with expanded data
    const tags = await ExifReader.load(buffer);
    console.log('Tags loaded, structure:', Object.keys(tags));

    // Helper function to safely get values
    const getValue = (tags, key, defaultValue = "N/A") => {
      try {
        const tag = tags[key];
        if (!tag) return defaultValue;

        // Handle different tag value formats
        if (tag.description) return tag.description;
        if (tag.value && Array.isArray(tag.value)) return tag.value.join(', ');
        if (tag.value) return tag.value;
        return defaultValue;
      } catch (e) {
        console.warn(`Error getting value for ${key}:`, e);
        return defaultValue;
      }
    };

    // Helper function for numeric values
    const getNumValue = (tags, key, defaultValue = 0) => {
      try {
        const tag = tags[key];
        if (!tag) return defaultValue;

        const value = tag.value || tag.description;
        if (Array.isArray(value)) return parseFloat(value[0]) || defaultValue;
        return parseFloat(value) || defaultValue;
      } catch (e) {
        console.warn(`Error getting numeric value for ${key}:`, e);
        return defaultValue;
      }
    };

    return {
      File: {
        Url: url,
        FileName: path.basename(url),
        FileSize: buffer.length,
        ImageWidth: getNumValue(tags, 'Image Width'),
        ImageHeight: getNumValue(tags, 'Image Height'),
        MIMEType: getValue(tags, 'MIMEType'),
        FileType: getValue(tags, 'FileType'),
        ColorSpace: getValue(tags, 'ColorSpace')
      },
      EXIF: {
        // Camera Info
        Make: getValue(tags, 'Make'),
        Model: getValue(tags, 'Model'),
        Software: getValue(tags, 'Software'),
        LensMake: getValue(tags, 'Lens Make'),
        LensModel: getValue(tags, 'Lens Model'),

        // Timestamps
        ModifyDate: getValue(tags, 'Modify Date'),
        DateTimeOriginal: getValue(tags, 'Date/Time Original'),
        CreateDate: getValue(tags, 'Create Date'),
        DigitalCreationDate: getValue(tags, 'Digital Creation Date'),

        // Image Info
        ImageDescription: getValue(tags, 'Image Description'),
        Artist: getValue(tags, 'Artist'),
        Copyright: getValue(tags, 'Copyright'),

        // Camera Settings
        ExposureTime: getValue(tags, 'Exposure Time'),
        FNumber: getValue(tags, 'F-Number'),
        ExposureProgram: getValue(tags, 'Exposure Program'),
        ISO: getValue(tags, 'ISO Speed Ratings'),
        ExposureCompensation: getValue(tags, 'Exposure Compensation'),
        FocalLength: getValue(tags, 'Focal Length'),
        FocalLengthIn35mmFormat: getValue(tags, 'Focal Length In 35mm Format'),
        MaxApertureValue: getValue(tags, 'Max Aperture Value'),
        MeteringMode: getValue(tags, 'Metering Mode'),
        LightSource: getValue(tags, 'Light Source'),
        Flash: getValue(tags, 'Flash'),
        WhiteBalance: getValue(tags, 'White Balance'),
        DigitalZoomRatio: getValue(tags, 'Digital Zoom Ratio'),
        SceneCaptureType: getValue(tags, 'Scene Capture Type'),
        Contrast: getValue(tags, 'Contrast'),
        Saturation: getValue(tags, 'Saturation'),
        Sharpness: getValue(tags, 'Sharpness')
      },
      IPTC: {
        Caption: getValue(tags, 'Caption/Abstract'),
        Headline: getValue(tags, 'Headline'),
        Keywords: getValue(tags, 'Keywords'),
        CopyrightNotice: getValue(tags, 'Copyright Notice'),
        Creator: getValue(tags, 'Creator'),
        DateCreated: getValue(tags, 'Date Created'),
        City: getValue(tags, 'City'),
        Country: getValue(tags, 'Country'),
        Source: getValue(tags, 'Source')
      },
      GPS: {
        Latitude: getValue(tags, 'GPS Latitude'),
        Longitude: getValue(tags, 'GPS Longitude'),
        Altitude: getValue(tags, 'GPS Altitude'),
        DateStamp: getValue(tags, 'GPS Date Stamp'),
        TimeStamp: getValue(tags, 'GPS Time Stamp')
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
