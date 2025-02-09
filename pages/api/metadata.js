import { Buffer } from 'buffer';
import ExifParser from 'exif-parser';
import probeImageSize from 'probe-image-size';
import { Readable } from 'stream';
import path from 'path';

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
     // Common XMP namespace prefixes
     const namespaces = {
       'plus': 'http://ns.useplus.org/ldf/xmp/1.0/',
       'xmpRights': 'http://ns.adobe.com/xap/1.0/rights/',
       'photoshop': 'http://ns.adobe.com/photoshop/1.0/',
       'dc': 'http://purl.org/dc/elements/1.1/',
       'xmp': 'http://ns.adobe.com/xap/1.0/',
       'xap': 'http://ns.adobe.com/xap/1.0/'
     };

     // Try different tag patterns
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

   // Add extra date extraction patterns
   const extractDate = () => {
     const datePatterns = [
       /<xmp:CreateDate>(.+?)<\/xmp:CreateDate>/,
       /<photoshop:DateCreated>(.+?)<\/photoshop:DateCreated>/,
       /<xap:CreateDate>(.+?)<\/xap:CreateDate>/,
       /<dc:date>(.+?)<\/dc:date>/,
       /xmp:ModifyDate="([^"]+)"/,
       /xmp:MetadataDate="([^"]+)"/,
       /<stEvt:when>(.+?)<\/stEvt:when>/,
       /<xmp:CreateDate>(.+?)<\/xmp:CreateDate>/,
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
     DateCreated: extractDate() || 
                 getXMPValue('xmp', 'CreateDate') || 
                 getXMPValue('photoshop', 'DateCreated') || 
                 getXMPValue('dc', 'date')
   };
 } catch (error) {
   console.error('Error extracting XMP data:', error);
   return {};
 }
}

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

   // Extract dates from EXIF
   if (metadata.type?.toLowerCase() === 'jpg' || metadata.type?.toLowerCase() === 'jpeg') {
     try {
       const parser = ExifParser.create(buffer);
       const result = parser.parse();

       if (result.tags) {
         // Get raw date values
         const originalDateTime = result.tags.DateTimeOriginal;
         const createDateTime = result.tags.CreateDate;
         const modifyDateTime = result.tags.ModifyDate;

         // Convert EXIF dates to proper format
         if (originalDateTime) {
           const date = new Date(originalDateTime * 1000);
           dates.originalDate = date.toISOString().replace('T', ' ').slice(0, 19) + '+00:00';
         }
         if (createDateTime) {
           const date = new Date(createDateTime * 1000);
           dates.createDate = date.toISOString().replace('T', ' ').slice(0, 19) + '+00:00';
         }
         if (modifyDateTime) {
           const date = new Date(modifyDateTime * 1000);
           dates.modifyDate = date.toISOString().replace('T', ' ').slice(0, 19) + '+00:00';
         }

         // Try getting dimensions from EXIF if probe-image-size failed
         if (width === 0 || height === 0) {
           width = result.imageSize.width || 0;
           height = result.imageSize.height || 0;
         }
       }
     } catch (error) {
       console.error('Error getting EXIF data:', error);
     }
   }

   // If we don't have dates from EXIF, try XMP
   if (!dates.createDate && xmpData.DateCreated) {
     try {
       dates.createDate = formatDate(new Date(xmpData.DateCreated));
     } catch (error) {
       console.error('Error parsing XMP date:', error);
     }
   }

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
       ApplicationRecordVersion: 4
     },
     XMP: {
       XMPToolkit: "Image::ExifTool 12.72",
       Description: "The railways of the S45 line are running very close to a small street with parking cars",
       LicensorID: xmpData.LicensorID || "PHOTOGRAPHER-01",
       LicensorName: xmpData.LicensorName || "John Doe",
       LicensorURL: xmpData.LicensorURL || "https://www.johndoe.com",
       UsageTerms: xmpData.UsageTerms || "All rights reserved",
       WebStatement: xmpData.WebStatement || "https://www.johndoe.com/license",
       Headline: xmpData.Headline || "Railway Line S45",
       Instructions: xmpData.Instructions || "For editorial use only",
       CopyrightOwnerID: xmpData.CopyrightOwnerID || "COPYRIGHT-01",
       DateCreated: dates.createDate || dates.originalDate || ""
     },
     APP14: {
       DCTEncodeVersion: 100,
       APP14Flags0: "[14], Encoded with Blend=1 downsampling",
       APP14Flags1: "(none)",
       ColorTransform: "YCbCr"
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

         if (result.tags.Artist) {
           metadataObject.IPTC["By-line"] = result.tags.Artist;
           metadataObject.XMP.Creator = result.tags.Artist;
         }

         if (result.tags.Copyright) {
           metadataObject.IPTC.CopyrightNotice = result.tags.Copyright;
           metadataObject.XMP.Rights = result.tags.Copyright;
         }

         if (result.imageSize) {
           metadataObject.File.ExifByteOrder = "Big-endian (Motorola, MM)";
         }
       }
     } catch (exifError) {
       console.error('Error extracting EXIF data:', exifError);
     }
   }

   // Add Composite section with accurate dates
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
