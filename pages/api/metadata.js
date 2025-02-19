import { exiftool } from 'exiftool-vendored';
import path from 'path';
import { Readable } from 'stream';
import { writeFile, unlink } from 'fs/promises';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

async function extractMetadata(buffer, url) {
  let tempFilePath = null;
  
  try {
    // Create a temporary file to store the buffer
    const tempFileName = `temp-${uuidv4()}${path.extname(url)}`;
    tempFilePath = path.join(os.tmpdir(), tempFileName);
    
    // Write buffer to temporary file
    await writeFile(tempFilePath, buffer);
    
    // Extract metadata using exiftool
    const metadata = await exiftool.read(tempFilePath);
    
    // Map the metadata to our required structure
    const metadataObject = {
      File: {
        Url: url,
        FileName: path.basename(url),
        FileSize: metadata.FileSize || 0,
        FileModifyDate: metadata.FileModifyDate || '',
        FileAccessDate: metadata.FileAccessDate || '',
        FileInodeChangeDate: metadata.FileInodeChangeDate || '',
        FileType: metadata.FileType || '',
        FileTypeExtension: metadata.FileTypeExtension || '',
        MIMEType: metadata.MIMEType || '',
        ExifByteOrder: metadata.ExifByteOrder || '',
        CurrentIPTCDigest: metadata.CurrentIPTCDigest || '',
        ImageWidth: metadata.ImageWidth || 0,
        ImageHeight: metadata.ImageHeight || 0,
        EncodingProcess: metadata.EncodingProcess || '',
        BitsPerSample: metadata.BitsPerSample || 0,
        ColorComponents: metadata.ColorComponents || 0,
        YCbCrSubSampling: metadata.YCbCrSubSampling || ''
      },
      EXIF: {
        Make: metadata.Make || '',
        Model: metadata.Model || '',
        Orientation: metadata.Orientation || '',
        XResolution: metadata.XResolution || 0,
        YResolution: metadata.YResolution || 0,
        ResolutionUnit: metadata.ResolutionUnit || '',
        Software: metadata.Software || '',
        ModifyDate: metadata.ModifyDate || '',
        Artist: metadata.Artist || '',
        ExposureTime: metadata.ExposureTime || '',
        FNumber: metadata.FNumber || 0,
        ExposureProgram: metadata.ExposureProgram || '',
        ISO: metadata.ISO || 0,
        ExifVersion: metadata.ExifVersion || '',
        DateTimeOriginal: metadata.DateTimeOriginal || '',
        CreateDate: metadata.CreateDate || '',
        ShutterSpeedValue: metadata.ShutterSpeedValue || '',
        ApertureValue: metadata.ApertureValue || 0,
        ExposureCompensation: metadata.ExposureCompensation || 0,
        MaxApertureValue: metadata.MaxApertureValue || 0,
        MeteringMode: metadata.MeteringMode || '',
        LightSource: metadata.LightSource || '',
        Flash: metadata.Flash || '',
        FocalLength: metadata.FocalLength || '',
        ColorSpace: metadata.ColorSpace || '',
        ExifImageWidth: metadata.ExifImageWidth || 0,
        ExifImageHeight: metadata.ExifImageHeight || 0,
        FileSource: metadata.FileSource || '',
        SceneType: metadata.SceneType || '',
        CustomRendered: metadata.CustomRendered || '',
        ExposureMode: metadata.ExposureMode || '',
        WhiteBalance: metadata.WhiteBalance || '',
        SceneCaptureType: metadata.SceneCaptureType || '',
        GainControl: metadata.GainControl || '',
        Contrast: metadata.Contrast || '',
        Saturation: metadata.Saturation || '',
        Sharpness: metadata.Sharpness || '',
        SubjectDistanceRange: metadata.SubjectDistanceRange || '',
        SerialNumber: metadata.SerialNumber || 0,
        LensMake: metadata.LensMake || '',
        LensModel: metadata.LensModel || '',
        GPSVersionID: metadata.GPSVersionID || '',
        GPSLatitudeRef: metadata.GPSLatitudeRef || '',
        GPSLatitude: metadata.GPSLatitude || '',
        GPSLongitudeRef: metadata.GPSLongitudeRef || '',
        GPSLongitude: metadata.GPSLongitude || '',
        GPSAltitudeRef: metadata.GPSAltitudeRef || '',
        GPSAltitude: metadata.GPSAltitude || '',
        Compression: metadata.Compression || '',
        ThumbnailOffset: metadata.ThumbnailOffset || 0,
        ThumbnailLength: metadata.ThumbnailLength || 0,
        ThumbnailImage: metadata.ThumbnailImage || ''
      },
      XMP: {
        XMPToolkit: metadata.XMPToolkit || '',
        ModifyDate: metadata.XMP?.ModifyDate || '',
        CreateDate: metadata.XMP?.CreateDate || '',
        CreatorTool: metadata.XMP?.CreatorTool || '',
        // ... map all other XMP fields from metadata.XMP
      },
      Photoshop: {
        XResolution: metadata.Photoshop?.XResolution || 0,
        DisplayedUnitsX: metadata.Photoshop?.DisplayedUnitsX || '',
        // ... map all other Photoshop fields from metadata.Photoshop
      },
      IPTC: {
        CodedCharacterSet: metadata.IPTC?.CodedCharacterSet || '',
        ApplicationRecordVersion: metadata.IPTC?.ApplicationRecordVersion || 0,
        DateCreated: metadata.IPTC?.DateCreated || '',
        TimeCreated: metadata.IPTC?.TimeCreated || '',
        'By-line': metadata.IPTC?.['By-line'] || ''
      },
      ICC_Profile: {
        ProfileCMMType: metadata.ICC_Profile?.ProfileCMMType || '',
        ProfileVersion: metadata.ICC_Profile?.ProfileVersion || '',
        // ... map all other ICC_Profile fields from metadata.ICC_Profile
      },
      APP14: {
        DCTEncodeVersion: metadata.APP14?.DCTEncodeVersion || 0,
        APP14Flags0: metadata.APP14?.APP14Flags0 || '',
        APP14Flags1: metadata.APP14?.APP14Flags1 || '',
        ColorTransform: metadata.APP14?.ColorTransform || ''
      },
      Composite: {
        Aperture: metadata.Composite?.Aperture || 0,
        ImageSize: metadata.Composite?.ImageSize || '',
        Megapixels: metadata.Composite?.Megapixels || 0,
        ShutterSpeed: metadata.Composite?.ShutterSpeed || '',
        GPSAltitude: metadata.Composite?.GPSAltitude || '',
        GPSLatitude: metadata.Composite?.GPSLatitude || '',
        GPSLongitude: metadata.Composite?.GPSLongitude || '',
        DateTimeCreated: metadata.Composite?.DateTimeCreated || '',
        FocalLength35efl: metadata.Composite?.FocalLength35efl || '',
        GPSPosition: metadata.Composite?.GPSPosition || '',
        LightValue: metadata.Composite?.LightValue || 0
      }
    };

    return metadataObject;

  } catch (error) {
    console.error('Error in extractMetadata:', error);
    throw new Error(`Error processing image: ${error.message}`);
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (error) {
        console.error('Error deleting temporary file:', error);
      }
    }
  }
}

// Update package.json
/*
{
  "dependencies": {
    "exiftool-vendored": "^16.3.0",
    "uuid": "^8.3.2"
  }
}
*/

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
  } finally {
    // Ensure exiftool process is closed
    await exiftool.end();
  }
}
