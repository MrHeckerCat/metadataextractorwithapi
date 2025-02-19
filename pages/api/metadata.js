import { Buffer } from 'buffer';
import ExifParser from 'exif-parser';
import probeImageSize from 'probe-image-size';
import { IptcParser } from 'node-iptc';
import jpeg from 'jpeg-js';
import path from 'path';
import { Readable } from 'stream';

function extractXMPData(buffer) {
  try {
    const bufferString = buffer.toString('binary');
    const xmpStart = bufferString.indexOf('<x:xmpmeta');
    const xmpEnd = bufferString.indexOf('</x:xmpmeta>');
    
    if (xmpStart === -1 || xmpEnd === -1) {
      return {};
    }
    
    const xmpPacket = bufferString.slice(xmpStart, xmpEnd + 12);
    
    const getXMPValue = (namespace, field) => {
      const namespaces = {
        'plus': 'http://ns.useplus.org/ldf/xmp/1.0/',
        'xmpRights': 'http://ns.adobe.com/xap/1.0/rights/',
        'photoshop': 'http://ns.adobe.com/photoshop/1.0/',
        'dc': 'http://purl.org/dc/elements/1.1/',
        'xmp': 'http://ns.adobe.com/xap/1.0/',
        'xap': 'http://ns.adobe.com/xap/1.0/'
      };

      const patterns = [
        `<${namespace}:${field}>(.*?)</${namespace}:${field}>`,
        `<${field}>(.*?)</${field}>`,
        `${field}="(.*?)"`,
        `<rdf:li>(.*?)</rdf:li>`
      ];

      for (const pattern of patterns) {
        const regex = new RegExp(pattern, 'i');
        const match = xmpPacket.match(regex);
        if (match) {
          return match[1].trim();
        }
      }
      return '';
    };

    const extractDate = () => {
      const datePatterns = [
        /<xmp:CreateDate>(.+?)<\/xmp:CreateDate>/,
        /<photoshop:DateCreated>(.+?)<\/photoshop:DateCreated>/,
        /<xap:CreateDate>(.+?)<\/xap:CreateDate>/,
        /<dc:date>(.+?)<\/dc:date>/,
        /xmp:ModifyDate="([^"]+)"/,
        /xmp:MetadataDate="([^"]+)"/,
        /<stEvt:when>(.+?)<\/stEvt:when>/,
        /photoshop:DateCreated="([^"]+)"/,
        /<xmp:ModifyDate>(.+?)<\/xmp:ModifyDate>/
      ];

      for (const pattern of datePatterns) {
        const match = xmpPacket.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      return '';
    };

    return {
      LicensorID: getXMPValue('plus', 'LicensorID'),
      LicensorName: getXMPValue('plus', 'LicensorName'),
      LicensorURL: getXMPValue('plus', 'LicensorURL'),
      UsageTerms: getXMPValue('xmpRights', 'UsageTerms'),
      WebStatement: getXMPValue('xmpRights', 'WebStatement'),
      Headline: getXMPValue('photoshop', 'Headline'),
      Instructions: getXMPValue('photoshop', 'Instructions'),
      CopyrightOwnerID: getXMPValue('plus', 'CopyrightOwnerID'),
      DateCreated: extractDate()
    };
  } catch (error) {
    console.error('Error extracting XMP data:', error);
    return {};
  }
}

function extractIPTCData(buffer) {
  try {
    const iptcData = IptcParser.parse(buffer);
    const iptc = {};
    
    if (iptcData) {
      const fieldMap = {
        '2:05': 'ObjectName',
        '2:10': 'Urgency',
        '2:15': 'Category',
        '2:20': 'SupplementalCategories',
        '2:25': 'Keywords',
        '2:40': 'SpecialInstructions',
        '2:55': 'DateCreated',
        '2:60': 'TimeCreated',
        '2:80': 'By-line',
        '2:85': 'By-lineTitle',
        '2:90': 'City',
        '2:95': 'Province-State',
        '2:101': 'Country-PrimaryLocationCode',
        '2:103': 'OriginalTransmissionReference',
        '2:105': 'Headline',
        '2:110': 'Credit',
        '2:115': 'Source',
        '2:116': 'CopyrightNotice',
        '2:120': 'Caption-Abstract'
      };

      Object.entries(fieldMap).forEach(([key, field]) => {
        if (iptcData[key]) {
          iptc[field] = iptcData[key];
        }
      });
    }

    return iptc;
  } catch (error) {
    console.error('Error extracting IPTC data:', error);
    return {};
  }
}

function extractAPP14Data(buffer) {
  try {
    const jpegData = jpeg.decode(buffer, { withMetadata: true });
    let app14 = {};
    
    if (jpegData.markers) {
      const app14Marker = jpegData.markers.find(marker => marker.type === 0xEE);
      
      if (app14Marker && app14Marker.data) {
        const data = app14Marker.data;
        
        if (data.length >= 12 && data.toString('ascii', 0, 5) === 'Adobe') {
          app14 = {
            DCTEncodeVersion: data[5],
            APP14Flags0: data[6],
            APP14Flags1: data[7],
            ColorTransform: data[8] === 0 ? 'RGB or CMYK' :
                          data[8] === 1 ? 'YCbCr' :
                          data[8] === 2 ? 'YCCK' : 'Unknown'
          };
        }
      }
    }
    
    return app14;
  } catch (error) {
    console.error('Error extracting APP14 data:', error);
    return {};
  }
}

function formatDate(date) {
  if (!date) return null;
  try {
    if (typeof date === 'number') {
      if (date < 0 || !Number.isFinite(date)) {
        return null;
      }
      const timestamp = date * (date < 10000000000 ? 1000 : 1);
      date = new Date(timestamp);
    }
    
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return null;
    }
    
    return date.toISOString().replace('T', ' ').slice(0, 19) + '+00:00';
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
}

async function extractMetadata(buffer, url) {
  try {
    let metadata;
    try {
      metadata = await probeImageSize(buffer);
    } catch (probeError) {
      console.error('Error probing image size:', probeError);
      metadata = {
        width: 0,
        height: 0,
        type: path.extname(url).slice(1) || 'unknown',
        mime: 'application/octet-stream'
      };
    }

    const currentDate = formatDate(new Date());
    const fileName = path.basename(url);
    const xmpData = extractXMPData(buffer);

    let width = metadata.width || 0;
    let height = metadata.height || 0;

    let dates = {
      originalDate: null,
      createDate: null,
      modifyDate: null
    };

    // EXIF extraction for JPG/JPEG
    if (metadata.type?.toLowerCase() === 'jpg' || metadata.type?.toLowerCase() === 'jpeg') {
      try {
        const parser = ExifParser.create(buffer);
        const result = parser.parse();

        if (result.tags) {
          const originalDateTime = result.tags.DateTimeOriginal;
          const createDateTime = result.tags.CreateDate;
          const modifyDateTime = result.tags.ModifyDate;

          if (originalDateTime) {
            dates.originalDate = formatDate(new Date(originalDateTime * 1000));
          }
          if (createDateTime) {
            dates.createDate = formatDate(new Date(createDateTime * 1000));
          }
          if (modifyDateTime) {
            dates.modifyDate = formatDate(new Date(modifyDateTime * 1000));
          }

          if (width === 0 || height === 0) {
            width = result.imageSize.width || 0;
            height = result.imageSize.height || 0;
          }
        }
      } catch (error) {
        console.error('Error getting EXIF data:', error);
      }
    }

    if (!dates.createDate && xmpData.DateCreated) {
      try {
        dates.createDate = formatDate(new Date(xmpData.DateCreated));
      } catch (error) {
        console.error('Error parsing XMP date:', error);
      }
    }

    // Extract IPTC and APP14 data
    const iptcData = extractIPTCData(buffer);
    const app14Data = extractAPP14Data(buffer);

    let metadataObject = {
      File: {
        Url: url,
        FileName: fileName,
        FileSize: buffer.length,
        FileModifyDate: currentDate,
        FileAccessDate: currentDate,
        FileInodeChangeDate: currentDate,
        FileType: metadata.type?.toUpperCase() || 'UNKNOWN',
        FileTypeExtension: metadata.type?.toLowerCase() || 'unknown',
        MIMEType: metadata.mime || 'application/octet-stream',
        ImageWidth: width,
        ImageHeight: height,
        ColorComponents: 3,
        EncodingProcess: "Baseline DCT, Huffman coding",
        BitsPerSample: 8,
        YCbCrSubSampling: "YCbCr4:4:4 (1 1)"
      },
      EXIF: {},
      IPTC: {
        ApplicationRecordVersion: 4,
        ...iptcData
      },
      XMP: {
        XMPToolkit: "Image::ExifTool 12.72",
        ...xmpData
      },
      APP14: app14Data.length > 0 ? app14Data : {
        DCTEncodeVersion: 0,
        APP14Flags0: "Unknown",
        APP14Flags1: "Unknown",
        ColorTransform: "Unknown"
      }
    };

    if (metadata.type?.toLowerCase() === 'jpg' || metadata.type?.toLowerCase() === 'jpeg') {
      try {
        const parser = ExifParser.create(buffer);
        const result = parser.parse();

        if (result.tags) {
          metadataObject.EXIF = {
            XResolution: result.tags.XResolution || 72,
            YResolution: result.tags.YResolution || 72,
            ResolutionUnit: "inches",
            Artist: result.tags.Artist || "",
            YCbCrPositioning: "Centered",
            Copyright: result.tags.Copyright || "",
            Make: result.tags.Make,
            Model: result.tags.Model,
            Software: result.tags.Software,
            ImageDescription: result.tags.ImageDescription || ""
          };

          if (dates.modifyDate) metadataObject.EXIF.ModifyDate = dates.modifyDate;
          if (dates.createDate) metadataObject.EXIF.CreateDate = dates.createDate;
          if (dates.originalDate) metadataObject.EXIF.DateTimeOriginal = dates.originalDate;

          if (result.tags.GPSLatitude && result.tags.GPSLongitude) {
            metadataObject.EXIF.GPSLatitude = result.tags.GPSLatitude;
            metadataObject.EXIF.GPSLongitude = result.tags.GPSLongitude;
            metadataObject.EXIF.GPSAltitude = result.tags.GPSAltitude;
            metadataObject.EXIF.GPSLatitudeRef = result.tags.GPSLatitudeRef;
            metadataObject.EXIF.GPSLongitudeRef = result.tags.GPSLongitudeRef;
            metadataObject.EXIF.GPSAltitudeRef = result.tags.GPSAltitudeRef;
          }

          Object.keys(metadataObject.EXIF).forEach(key => {
            if (metadataObject.EXIF[key] === undefined) {
              delete metadataObject.EXIF[key];
            }
          });
        }
      } catch (exifError) {
        console.error('Error extracting EXIF data:', exifError);
      }
    }

    metadataObject.Composite = {
      ImageSize: width && height ? `${width}x${height}` : "0x0",
      Megapixels: width && height ? ((width * height) / 1000000).toFixed(2) : "0.00",
      DateTimeCreated: dates.createDate || dates.originalDate || "",
      DateTimeOriginal: dates.originalDate || dates.createDate || ""
    };

    return metadataObject;
  } catch (error) {
    console.error('Error in extractMetadata:', error);
    throw new Error(`Error processing image: ${error.message}`);
  }
}

export async function verifyTurnstileToken(token) {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: '0x4AAAAAAA6sKyP7fuZYrlRwvvZA4jVc2wM',
        response: token,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return { success: false, error: 'Failed to verify CAPTCHA' };
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, turnstileToken } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  if (!turnstileToken) {
    return res.status(400).json({ error: 'CAPTCHA token is required' });
  }

  try {
    const verification = await verifyTurnstileToken(turnstileToken);
    if (!verification.success) {
      return res.status(400).json({ 
        error: 'Invalid CAPTCHA', 
        details: verification.error || 'CAPTCHA verification failed'
      });
    }

    const imageResponse = await fetch(url);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);
    const metadata = await extractMetadata(buffer, url);

    res.status(200).json(metadata);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch metadata', 
      details: error.message
    });
  }
}

// Export necessary functions for testing or external use
export {
  extractMetadata,
  extractXMPData,
  extractIPTCData,
  extractAPP14Data,
  formatDate
};
