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

    // Load tags with expanded data and all options enabled
    const tags = await ExifReader.load(buffer, {
      expanded: true,
      includeUnknown: true,  // Include unknown tags
      async: true,           // Use async loading
      length: true,          // Include data lengths
      mergeOutput: false     // Keep sections separate
    });

    console.log('Raw tags:', JSON.stringify(tags, null, 2));

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

    return {
      File: {
        Url: url,
        FileName: path.basename(url),
        FileSize: buffer.length,
        ImageWidth: getNumValue(tags.file, 'ImageWidth'),
        ImageHeight: getNumValue(tags.file, 'ImageHeight'),
        MIMEType: getValue(tags.file, 'MIMEType'),
        FileType: getValue(tags.file, 'FileType'),
        FileTypeExtension: getValue(tags.file, 'FileTypeExtension'),
        ColorSpace: getValue(tags.file, 'ColorSpace'),
        ImageSize: getValue(tags.file, 'ImageSize')
      },
      EXIF: {
        // Camera Info
        Make: getValue(tags.exif, 'Make'),
        Model: getValue(tags.exif, 'Model'),
        Software: getValue(tags.exif, 'Software'),
        LensMake: getValue(tags.exif, 'LensMake'),
        LensModel: getValue(tags.exif, 'LensModel'),

        // Timestamps
        ModifyDate: getValue(tags.exif, 'ModifyDate'),
        DateTimeOriginal: getValue(tags.exif, 'DateTimeOriginal'),
        CreateDate: getValue(tags.exif, 'CreateDate'),
        DigitalCreationDate: getValue(tags.exif, 'DigitalCreationDate'),

        // Image Info
        ImageDescription: getValue(tags.exif, 'ImageDescription'),
        Artist: getValue(tags.exif, 'Artist'),
        Copyright: getValue(tags.exif, 'Copyright'),

        // Camera Settings
        ExposureTime: getValue(tags.exif, 'ExposureTime'),
        FNumber: getValue(tags.exif, 'FNumber'),
        ExposureProgram: getValue(tags.exif, 'ExposureProgram'),
        ISO: getValue(tags.exif, 'ISO'),
        SensitivityType: getValue(tags.exif, 'SensitivityType'),
        ExposureCompensation: getValue(tags.exif, 'ExposureCompensation'),
        FocalLength: getValue(tags.exif, 'FocalLength'),
        FocalLengthIn35mmFormat: getValue(tags.exif, 'FocalLengthIn35mmFormat'),
        MaxApertureValue: getValue(tags.exif, 'MaxApertureValue'),
        MeteringMode: getValue(tags.exif, 'MeteringMode'),
        LightSource: getValue(tags.exif, 'LightSource'),
        Flash: getValue(tags.exif, 'Flash'),
        FlashMode: getValue(tags.exif, 'FlashMode'),
        WhiteBalance: getValue(tags.exif, 'WhiteBalance'),
        DigitalZoomRatio: getValue(tags.exif, 'DigitalZoomRatio'),
        SceneCaptureType: getValue(tags.exif, 'SceneCaptureType'),
        Contrast: getValue(tags.exif, 'Contrast'),
        Saturation: getValue(tags.exif, 'Saturation'),
        Sharpness: getValue(tags.exif, 'Sharpness'),
        SubjectDistanceRange: getValue(tags.exif, 'SubjectDistanceRange'),

        // GPS Data (if available)
        GPSLatitude: getValue(tags.gps, 'GPSLatitude'),
        GPSLongitude: getValue(tags.gps, 'GPSLongitude'),
        GPSAltitude: getValue(tags.gps, 'GPSAltitude'),
        GPSDateStamp: getValue(tags.gps, 'GPSDateStamp')
      },
      IPTC: {
        Caption: getValue(tags.iptc, 'Caption'),
        Headline: getValue(tags.iptc, 'Headline'),
        Keywords: getValue(tags.iptc, 'Keywords'),
        CopyrightNotice: getValue(tags.iptc, 'CopyrightNotice'),
        Creator: getValue(tags.iptc, 'Creator'),
        DateCreated: getValue(tags.iptc, 'DateCreated'),
        Category: getValue(tags.iptc, 'Category'),
        SupplementalCategories: getValue(tags.iptc, 'SupplementalCategories'),
        Urgency: getValue(tags.iptc, 'Urgency'),
        SubjectReference: getValue(tags.iptc, 'SubjectReference'),
        City: getValue(tags.iptc, 'City'),
        Country: getValue(tags.iptc, 'Country'),
        Source: getValue(tags.iptc, 'Source'),
        EditStatus: getValue(tags.iptc, 'EditStatus'),
        ObjectName: getValue(tags.iptc, 'ObjectName')
      },
      XMP: {
        // Core Properties
        Creator: getValue(tags.xmp, 'Creator'),
        Rights: getValue(tags.xmp, 'Rights'),
        Title: getValue(tags.xmp, 'Title'),
        Description: getValue(tags.xmp, 'Description'),
        License: getValue(tags.xmp, 'WebStatement'),
        UsageTerms: getValue(tags.xmp, 'UsageTerms'),

        // Additional Properties
        Rating: getValue(tags.xmp, 'Rating'),
        Label: getValue(tags.xmp, 'Label'),
        CreatorTool: getValue(tags.xmp, 'CreatorTool'),
        Subject: getValue(tags.xmp, 'Subject'),
        Format: getValue(tags.xmp, 'Format'),

        // Rights Management
        Owner: getValue(tags.xmp, 'Owner'),
        CopyrightStatus: getValue(tags.xmp, 'CopyrightStatus'),
        MarkedForAds: getValue(tags.xmp, 'MarkedForAds'),
        WebStatement: getValue(tags.xmp, 'WebStatement'),
        RightsUsageTerms: getValue(tags.xmp, 'RightsUsageTerms'),

        // Location
        Location: getValue(tags.xmp, 'Location'),
        City: getValue(tags.xmp, 'City'),
        State: getValue(tags.xmp, 'State'),
        Country: getValue(tags.xmp, 'Country')
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
