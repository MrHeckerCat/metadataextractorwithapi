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
    // Create temporary file with unique name
    const tempFileName = `temp-${uuidv4()}${path.extname(url)}`;
    tempFilePath = path.join(os.tmpdir(), tempFileName);
    
    // Write buffer to temp file
    await writeFile(tempFilePath, buffer);

    // Extract metadata with shorter timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Metadata extraction timed out')), 25000);
    });

    const metadataPromise = et.read(tempFilePath);
    const metadata = await Promise.race([metadataPromise, timeoutPromise]);

    // Prioritize essential metadata first
    const essentialMetadata = {
      File: {
        Url: url,
        FileName: path.basename(url),
        FileSize: metadata.FileSize || 0,
        FileType: metadata.FileType || '',
        MIMEType: metadata.MIMEType || '',
        ImageWidth: metadata.ImageWidth || 0,
        ImageHeight: metadata.ImageHeight || 0
      },
      EXIF: {
        Make: metadata.Make || '',
        Model: metadata.Model || '',
        DateTimeOriginal: metadata.DateTimeOriginal || '',
        CreateDate: metadata.CreateDate || '',
        ExposureTime: metadata.ExposureTime || '',
        FNumber: metadata.FNumber || 0,
        ISO: metadata.ISO || 0,
        FocalLength: metadata.FocalLength || ''
      },
      Composite: {
        ImageSize: `${metadata.ImageWidth || 0}x${metadata.ImageHeight || 0}`,
        Megapixels: ((metadata.ImageWidth || 0) * (metadata.ImageHeight || 0) / 1000000).toFixed(2)
      }
    };

    // Try to get additional metadata if time permits
    try {
      const additionalMetadata = {
        XMP: metadata.XMP || {},
        IPTC: metadata.IPTC || {},
        ICC_Profile: metadata.ICC_Profile || {},
        APP14: metadata.APP14 || {}
      };

      return {
        ...essentialMetadata,
        ...additionalMetadata
      };
    } catch (additionalError) {
      console.warn('Could not extract additional metadata:', additionalError);
      return essentialMetadata;
    }

  } catch (error) {
    if (error.message.includes('timed out')) {
      // If timeout occurred, try to return basic file info
      const basicInfo = {
        File: {
          Url: url,
          FileName: path.basename(url),
          FileSize: buffer.length,
          FileType: path.extname(url).slice(1).toUpperCase() || 'UNKNOWN',
          MIMEType: 'image/' + (path.extname(url).slice(1).toLowerCase() || 'unknown')
        },
        error: 'Partial metadata extracted due to timeout'
      };
      return basicInfo;
    }
    throw error;
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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, turnstileToken } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Set up fetch with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // Reduced timeout

    try {
      const imageResponse = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
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
    try {
      if (exiftoolProcess) {
        await exiftoolProcess.end();
        exiftoolProcess = null;
      }
    } catch (cleanupError) {
      console.error('Error cleaning up exiftool:', cleanupError);
    }
  }
}

export { extractMetadata };
