import { Buffer } from 'buffer';
import ExifParser from 'exif-parser';
import probeImageSize from 'probe-image-size';
import { Readable } from 'stream';
import path from 'path';

async function verifyTurnstileToken(token) {
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
    const readableStream = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      }
    });

    let metadata;
    try {
      metadata = await probeImageSize(readableStream);
    } catch (streamError) {
      console.error('Error using probe-image-size with stream:', streamError);
      try {
        metadata = await probeImageSize(buffer);
      } catch (bufferError) {
        console.error('Error using probe-image-size with buffer:', bufferError);
        try {
          metadata = await probeImageSize(url);
        } catch (urlError) {
          console.error('Error using probe-image-size with URL:', urlError);
          throw new Error('Failed to probe image dimensions');
        }
      }
    }

    const currentDate = formatDate(new Date());
    const fileName = path.basename(url);

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
        ImageWidth: metadata.width || 0,
        ImageHeight: metadata.height || 0,
        ColorComponents: 3,
        EncodingProcess: "Baseline DCT, Huffman coding",
        BitsPerSample: 8,
        YCbCrSubSampling: "YCbCr4:4:4 (1 1)"
      },
      EXIF: {},
      IPTC: {
        ApplicationRecordVersion: 4
      },
      XMP: {
        XMPToolkit: "Image::ExifTool 12.72"
          Headline: "",
  Instructions: "",
  CopyrightOwnerID: "",
  CopyrightOwnerName: "",
  ImageCreatorID: "",
  ImageCreatorName: "",
  LicensorID: "",
  LicensorName: "",
  LicensorURL: "",
  UsageTerms: "",
  WebStatement: ""
      },
      APP14: {
        DCTEncodeVersion: 100,
        APP14Flags0: "[14], Encoded with Blend=1 downsampling",
        APP14Flags1: "(none)",
        ColorTransform: "YCbCr"
      },
      Composite: {
        ImageSize: `${metadata.width || 0}x${metadata.height || 0}`,
        Megapixels: (((metadata.width || 0) * (metadata.height || 0)) / 1000000).toFixed(1)
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

          // Handle dates safely
          const modifyDate = formatDate(result.tags.ModifyDate);
          if (modifyDate) metadataObject.EXIF.ModifyDate = modifyDate;

          const createDate = formatDate(result.tags.CreateDate);
          if (createDate) metadataObject.EXIF.CreateDate = createDate;

          const originalDate = formatDate(result.tags.DateTimeOriginal);
          if (originalDate) metadataObject.EXIF.DateTimeOriginal = originalDate;

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

          if (result.tags.Artist) {
            metadataObject.IPTC["By-line"] = result.tags.Artist;
            metadataObject.XMP.Creator = result.tags.Artist;
            metadataObject.XMP.ImageCreatorName = result.tags.Artist;
          }

          if (result.tags.Copyright) {
            metadataObject.IPTC.CopyrightNotice = result.tags.Copyright;
            metadataObject.XMP.Rights = result.tags.Copyright;
            metadataObject.XMP.CopyrightOwnerName = result.tags.Copyright;
          }

          if (result.imageSize) {
            metadataObject.File.ExifByteOrder = "Big-endian (Motorola, MM)";
          }
        }
      } catch (exifError) {
        console.error('Error extracting EXIF data:', exifError);
      }
    }

    return metadataObject;
  } catch (error) {
    console.error('Error in extractMetadata:', error);
    throw new Error(`Error processing image: ${error.message}`);
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
      error: 'Request failed', 
      details: error.message
    });
  }
}
