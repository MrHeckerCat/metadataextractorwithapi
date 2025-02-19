import { exiftool } from 'exiftool-vendored';
import path from 'path';
import { writeFile, unlink } from 'fs/promises';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

let exiftoolProcess = null;

async function getExiftool() {
  if (!exiftoolProcess) {
    exiftoolProcess = exiftool;
  }
  return exiftoolProcess;
}

async function extractMetadata(buffer, url) {
  let tempFilePath = null;
  const et = await getExiftool();
  
  try {
    const tempFileName = `temp-${uuidv4()}${path.extname(url)}`;
    tempFilePath = path.join(os.tmpdir(), tempFileName);
    
    await writeFile(tempFilePath, buffer);

    // Reduce timeout to 15 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Metadata extraction timed out')), 15000);
    });

    // Extract metadata
    const metadataPromise = et.read(tempFilePath);
    const metadata = await Promise.race([metadataPromise, timeoutPromise]);

    return {
      File: {
        Url: url,
        FileName: path.basename(url),
        FileSize: metadata.FileSize || buffer.length,
        FileModifyDate: metadata.FileModifyDate || '',
        FileAccessDate: metadata.FileAccessDate || '',
        FileInodeChangeDate: metadata.FileInodeChangeDate || '',
        FileType: metadata.FileType || path.extname(url).slice(1).toUpperCase(),
        FileTypeExtension: metadata.FileTypeExtension || path.extname(url).slice(1).toLowerCase(),
        MIMEType: metadata.MIMEType || `image/${path.extname(url).slice(1).toLowerCase()}`,
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
        Software: metadata.Software || '',
        ModifyDate: metadata.ModifyDate || '',
        DateTimeOriginal: metadata.DateTimeOriginal || '',
        CreateDate: metadata.CreateDate || '',
        ExposureTime: metadata.ExposureTime || '',
        FNumber: metadata.FNumber || 0,
        ISO: metadata.ISO || 0,
        FocalLength: metadata.FocalLength || '',
        GPSLatitude: metadata.GPSLatitude || '',
        GPSLongitude: metadata.GPSLongitude || ''
      },
      Composite: {
        ImageSize: `${metadata.ImageWidth || 0}x${metadata.ImageHeight || 0}`,
        Megapixels: ((metadata.ImageWidth || 0) * (metadata.ImageHeight || 0) / 1000000).toFixed(2),
        GPSPosition: metadata.GPSPosition || ''
      }
    };

  } catch (error) {
    console.error('Metadata extraction error:', error);
    // Return basic file info on error
    return {
      File: {
        Url: url,
        FileName: path.basename(url),
        FileSize: buffer.length,
        FileType: path.extname(url).slice(1).toUpperCase() || 'UNKNOWN',
        MIMEType: 'image/' + (path.extname(url).slice(1).toLowerCase() || 'unknown'),
        ImageWidth: 0,
        ImageHeight: 0
      }
    };
  } finally {
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (error) {
        console.error('Error deleting temporary file:', error);
      }
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const imageResponse = await fetch(url, {
        signal: controller.signal
      });

      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(imageBuffer);
      
      const metadata = await extractMetadata(buffer, url);
      return res.status(200).json(metadata);

    } finally {
      clearTimeout(timeout);
    }

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      error: 'Request failed',
      details: error.message
    });
  } finally {
    if (exiftoolProcess) {
      try {
        await exiftoolProcess.end();
        exiftoolProcess = null;
      } catch (error) {
        console.error('Error cleaning up exiftool:', error);
      }
    }
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false
  },
};
