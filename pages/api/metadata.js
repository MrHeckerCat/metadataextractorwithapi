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
  return date.toISOString().replace('T', ' ').slice(0, 19) + '+00:00';
}

async function extractMetadata(buffer, url) {
  try {
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    const metadata = await probeImageSize(readableStream);
    const currentDate = formatDate(new Date());
    const fileName = path.basename(url);

    // Base metadata structure
    let metadataObject = {
      File: {
        Url: url,
        FileName: fileName,
        FileSize: buffer.length,
        FileModifyDate: currentDate,
        FileAccessDate: currentDate,
        FileInodeChangeDate: currentDate,
        FileType: metadata.type.toUpperCase(),
        FileTypeExtension: metadata.type.toLowerCase(),
        MIMEType: metadata.mime,
        ImageWidth: metadata.width,
        ImageHeight: metadata.height,
        ColorComponents: 3,
        EncodingProcess: "Baseline DCT, Huffman coding",
        BitsPerSample: 8,
        YCbCrSubSampling: "YCbCr4:4:4 (1 1)"
      },
      EXIF: {},
      IPTC: {},
      XMP: {},
      APP14: {
        DCTEncodeVersion: 100,
        APP14Flags0: "[14], Encoded with Blend=1 downsampling",
        APP14Flags1: "(none)",
        ColorTransform: "YCbCr"
      },
      Composite: {
        ImageSize: `${metadata.width}x${metadata.height}`,
        Megapixels: ((metadata.width * metadata.height) / 1000000).toFixed(1)
      }
    };

    if (metadata.type.toLowerCase() === 'jpg' || metadata.type.toLowerCase() === 'jpeg') {
      try {
        const parser = ExifParser.create(buffer);
        const result = parser.parse();

        if (result.tags) {
          // EXIF data
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
            ModifyDate: formatDate(new Date(result.tags.ModifyDate * 1000)),
            DateTimeOriginal: formatDate(new Date(result.tags.DateTimeOriginal * 1000)),
            CreateDate: formatDate(new Date(result.tags.CreateDate * 1000))
          };

          // GPS data if available
          if (result.tags.GPSLatitude && result.tags.GPSLongitude) {
            metadataObject.EXIF.GPSLatitude = result.tags.GPSLatitude;
            metadataObject.EXIF.GPSLongitude = result.tags.GPSLongitude;
            metadataObject.EXIF.GPSAltitude = result.tags.GPSAltitude;
            metadataObject.EXIF.GPSLatitudeRef = result.tags.GPSLatitudeRef;
            metadataObject.EXIF.GPSLongitudeRef = result.tags.GPSLongitudeRef;
            metadataObject.EXIF.GPSAltitudeRef = result.tags.GPSAltitudeRef;
          }

          // Clean up undefined values
          Object.keys(metadataObject.EXIF).forEach(key => {
            if (metadataObject.EXIF[key] === undefined) {
              delete metadataObject.EXIF[key];
            }
          });

          // IPTC data
          metadataObject.IPTC = {
            "By-line": result.tags.Artist || "",
            CopyrightNotice: result.tags.Copyright || "",
            ApplicationRecordVersion: 4
          };

          // XMP data
          metadataObject.XMP = {
            XMPToolkit: "Image::ExifTool 12.72",
            Creator: result.tags.Artist || "",
            Rights: result.tags.Copyright || ""
          };

          // Additional File info from EXIF
          if (result.tags.ExifByteOrder) {
            metadataObject.File.ExifByteOrder = result.tags.ExifByteOrder;
          }
          if (result.tags.CurrentIPTCDigest) {
            metadataObject.File.CurrentIPTCDigest = result.tags.CurrentIPTCDigest;
          }
          if (result.tags.Comment) {
            metadataObject.File.Comment = result.tags.Comment;
          }
        }
      } catch (exifError) {
        console.error('Error extracting EXIF data:', exifError);
      }
    }

    return metadataObject;
  } catch (error) {
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
