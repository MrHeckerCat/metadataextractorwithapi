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
  let tempFilePath = null;
  const et = await getExiftool();
  
  try {
    const tempFileName = `temp-${uuidv4()}${path.extname(url)}`;
    tempFilePath = path.join(os.tmpdir(), tempFileName);
    await writeFile(tempFilePath, buffer);

    // Increase timeout to 2 minutes (120000ms)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Metadata extraction timed out after 120 seconds')), 120000);
    });

    // Add progress tracking
    const metadataPromise = et.read(tempFilePath).catch(err => {
      throw new Error(`ExifTool error: ${err.message}`);
    });

    const metadata = await Promise.race([metadataPromise, timeoutPromise]);

    // Add validation check
    if (!metadata) {
      throw new Error('No metadata extracted from image');
    }

    // Create full metadata object with all fields
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
        Copyright: metadata.Copyright || '',
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
        Rating: metadata.XMP?.Rating || 0,
        MetadataDate: metadata.XMP?.MetadataDate || '',
        Format: metadata.XMP?.Format || '',
        Latitude: metadata.XMP?.Latitude || '',
        Longitude: metadata.XMP?.Longitude || '',
        AbsoluteAltitude: metadata.XMP?.AbsoluteAltitude || '',
        RelativeAltitude: metadata.XMP?.RelativeAltitude || '',
        GimbalRollDegree: metadata.XMP?.GimbalRollDegree || '',
        GimbalYawDegree: metadata.XMP?.GimbalYawDegree || 0,
        GimbalPitchDegree: metadata.XMP?.GimbalPitchDegree || '',
        FlightRollDegree: metadata.XMP?.FlightRollDegree || 0,
        FlightYawDegree: metadata.XMP?.FlightYawDegree || 0,
        FlightPitchDegree: metadata.XMP?.FlightPitchDegree || '',
        CamReverse: metadata.XMP?.CamReverse || 0,
        GimbalReverse: metadata.XMP?.GimbalReverse || 0,
        SelfData: metadata.XMP?.SelfData || '',
        SerialNumber: metadata.XMP?.SerialNumber || 0,
        Lens: metadata.XMP?.Lens || '',
        DistortionCorrectionAlreadyApplied: metadata.XMP?.DistortionCorrectionAlreadyApplied || false,
        LateralChromaticAberrationCorrectionAlreadyApplied: metadata.XMP?.LateralChromaticAberrationCorrectionAlreadyApplied || false,
        DateCreated: metadata.XMP?.DateCreated || '',
        DocumentID: metadata.XMP?.DocumentID || '',
        OriginalDocumentID: metadata.XMP?.OriginalDocumentID || '',
        InstanceID: metadata.XMP?.InstanceID || '',
        Marked: metadata.XMP?.Marked || false,
        RawFileName: metadata.XMP?.RawFileName || '',
        Version: metadata.XMP?.Version || 0,
        ProcessVersion: metadata.XMP?.ProcessVersion || 0,
        WhiteBalance: metadata.XMP?.WhiteBalance || '',
        ColorTemperature: metadata.XMP?.ColorTemperature || 0,
        Tint: metadata.XMP?.Tint || 0,
        Saturation: metadata.XMP?.Saturation || '',
        Sharpness: metadata.XMP?.Sharpness || 0,
        LuminanceSmoothing: metadata.XMP?.LuminanceSmoothing || 0,
        ColorNoiseReduction: metadata.XMP?.ColorNoiseReduction || 0,
        VignetteAmount: metadata.XMP?.VignetteAmount || 0,
        ShadowTint: metadata.XMP?.ShadowTint || 0,
        RedHue: metadata.XMP?.RedHue || 0,
        RedSaturation: metadata.XMP?.RedSaturation || 0,
        GreenHue: metadata.XMP?.GreenHue || 0,
        GreenSaturation: metadata.XMP?.GreenSaturation || 0,
        BlueHue: metadata.XMP?.BlueHue || 0,
        BlueSaturation: metadata.XMP?.BlueSaturation || 0,
        Vibrance: metadata.XMP?.Vibrance || '',
        HueAdjustmentRed: metadata.XMP?.HueAdjustmentRed || 0,
        HueAdjustmentOrange: metadata.XMP?.HueAdjustmentOrange || 0,
        HueAdjustmentYellow: metadata.XMP?.HueAdjustmentYellow || 0,
        HueAdjustmentGreen: metadata.XMP?.HueAdjustmentGreen || 0,
        HueAdjustmentAqua: metadata.XMP?.HueAdjustmentAqua || 0,
        HueAdjustmentBlue: metadata.XMP?.HueAdjustmentBlue || 0,
        HueAdjustmentPurple: metadata.XMP?.HueAdjustmentPurple || 0,
        HueAdjustmentMagenta: metadata.XMP?.HueAdjustmentMagenta || 0,
        SaturationAdjustmentRed: metadata.XMP?.SaturationAdjustmentRed || 0,
        SaturationAdjustmentOrange: metadata.XMP?.SaturationAdjustmentOrange || 0,
        SaturationAdjustmentYellow: metadata.XMP?.SaturationAdjustmentYellow || 0,
        SaturationAdjustmentGreen: metadata.XMP?.SaturationAdjustmentGreen || 0,
        SaturationAdjustmentAqua: metadata.XMP?.SaturationAdjustmentAqua || 0,
        SaturationAdjustmentBlue: metadata.XMP?.SaturationAdjustmentBlue || 0,
        SaturationAdjustmentPurple: metadata.XMP?.SaturationAdjustmentPurple || 0,
        SaturationAdjustmentMagenta: metadata.XMP?.SaturationAdjustmentMagenta || 0,
        LuminanceAdjustmentRed: metadata.XMP?.LuminanceAdjustmentRed || 0,
        LuminanceAdjustmentOrange: metadata.XMP?.LuminanceAdjustmentOrange || 0,
        LuminanceAdjustmentYellow: metadata.XMP?.LuminanceAdjustmentYellow || 0,
        LuminanceAdjustmentGreen: metadata.XMP?.LuminanceAdjustmentGreen || 0,
        LuminanceAdjustmentAqua: metadata.XMP?.LuminanceAdjustmentAqua || 0,
        LuminanceAdjustmentBlue: metadata.XMP?.LuminanceAdjustmentBlue || 0,
        LuminanceAdjustmentPurple: metadata.XMP?.LuminanceAdjustmentPurple || 0,
        LuminanceAdjustmentMagenta: metadata.XMP?.LuminanceAdjustmentMagenta || 0,
        SplitToningShadowHue: metadata.XMP?.SplitToningShadowHue || 0,
        SplitToningShadowSaturation: metadata.XMP?.SplitToningShadowSaturation || 0,
        SplitToningHighlightHue: metadata.XMP?.SplitToningHighlightHue || 0,
        SplitToningHighlightSaturation: metadata.XMP?.SplitToningHighlightSaturation || 0,
        SplitToningBalance: metadata.XMP?.SplitToningBalance || 0,
        ParametricShadows: metadata.XMP?.ParametricShadows || 0,
        ParametricDarks: metadata.XMP?.ParametricDarks || 0,
        ParametricLights: metadata.XMP?.ParametricLights || 0,
        ParametricHighlights: metadata.XMP?.ParametricHighlights || 0,
        ParametricShadowSplit: metadata.XMP?.ParametricShadowSplit || 0,
        ParametricMidtoneSplit: metadata.XMP?.ParametricMidtoneSplit || 0,
        ParametricHighlightSplit: metadata.XMP?.ParametricHighlightSplit || 0,
        SharpenRadius: metadata.XMP?.SharpenRadius || '',
        SharpenDetail: metadata.XMP?.SharpenDetail || 0,
        SharpenEdgeMasking: metadata.XMP?.SharpenEdgeMasking || 0,
        PostCropVignetteAmount: metadata.XMP?.PostCropVignetteAmount || 0,
        GrainAmount: metadata.XMP?.GrainAmount || 0,
        LuminanceNoiseReductionDetail: metadata.XMP?.LuminanceNoiseReductionDetail || 0,
        ColorNoiseReductionDetail: metadata.XMP?.ColorNoiseReductionDetail || 0,
        LuminanceNoiseReductionContrast: metadata.XMP?.LuminanceNoiseReductionContrast || 0,
        ColorNoiseReductionSmoothness: metadata.XMP?.ColorNoiseReductionSmoothness || 0,
        LensProfileEnable: metadata.XMP?.LensProfileEnable || 0,
        LensManualDistortionAmount: metadata.XMP?.LensManualDistortionAmount || 0,
        PerspectiveVertical: metadata.XMP?.PerspectiveVertical || 0,
        PerspectiveHorizontal: metadata.XMP?.PerspectiveHorizontal || 0,
        PerspectiveRotate: metadata.XMP?.PerspectiveRotate || 0,
        PerspectiveScale: metadata.XMP?.PerspectiveScale || 0,
        PerspectiveAspect: metadata.XMP?.PerspectiveAspect || 0,
        PerspectiveUpright: metadata.XMP?.PerspectiveUpright || 0,
        PerspectiveX: metadata.XMP?.PerspectiveX || 0,
        PerspectiveY: metadata.XMP?.PerspectiveY || 0,
        AutoLateralCA: metadata.XMP?.AutoLateralCA || 0,
        Exposure2012: metadata.XMP?.Exposure2012 || 0,
        Contrast2012: metadata.XMP?.Contrast2012 || '',
        Highlights2012: metadata.XMP?.Highlights2012 || 0,
        Shadows2012: metadata.XMP?.Shadows2012 || '',
        Whites2012: metadata.XMP?.Whites2012 || '',
        Blacks2012: metadata.XMP?.Blacks2012 || 0,
        Clarity2012: metadata.XMP?.Clarity2012 || '',
        DefringePurpleAmount: metadata.XMP?.DefringePurpleAmount || 0,
        DefringePurpleHueLo: metadata.XMP?.DefringePurpleHueLo || 0,
        DefringePurpleHueHi: metadata.XMP?.DefringePurpleHueHi || 0,
        DefringeGreenAmount: metadata.XMP?.DefringeGreenAmount || 0,
        DefringeGreenHueLo: metadata.XMP?.DefringeGreenHueLo || 0,
        DefringeGreenHueHi: metadata.XMP?.DefringeGreenHueHi || 0,
        Dehaze: metadata.XMP?.Dehaze || '',
        ToneCurveName: metadata.XMP?.ToneCurveName || '',
        ToneCurveName2012: metadata.XMP?.ToneCurveName2012 || '',
        CameraProfile: metadata.XMP?.CameraProfile || '',
        CameraProfileDigest: metadata.XMP?.CameraProfileDigest || '',
        LensProfileSetup: metadata.XMP?.LensProfileSetup || '',
        UprightVersion: metadata.XMP?.UprightVersion || 0,
        UprightCenterMode: metadata.XMP?.UprightCenterMode || 0,
        UprightCenterNormX: metadata.XMP?.UprightCenterNormX || 0,
        UprightCenterNormY: metadata.XMP?.UprightCenterNormY || 0,
        UprightFocalMode: metadata.XMP?.UprightFocalMode || 0,
        UprightFocalLength35mm: metadata.XMP?.UprightFocalLength35mm || 0,
        UprightPreview: metadata.XMP?.UprightPreview || false,
        UprightTransformCount: metadata.XMP?.UprightTransformCount || 0,
        UprightFourSegmentsCount: metadata.XMP?.UprightFourSegmentsCount || 0,
        HasSettings: metadata.XMP?.HasSettings || false,
        HasCrop: metadata.XMP?.HasCrop || false,
        AlreadyApplied: metadata.XMP?.AlreadyApplied || false,
        Creator: metadata.XMP?.Creator || '',
        CreatorWorkEmail: metadata.XMP?.CreatorWorkEmail || '',
        CreatorWorkURL: metadata.XMP?.CreatorWorkURL || ''
      },
      Photoshop: {
        XResolution: metadata.Photoshop?.XResolution || 0,
        DisplayedUnitsX: metadata.Photoshop?.DisplayedUnitsX || '',
        YResolution: metadata.Photoshop?.YResolution || 0,
        DisplayedUnitsY: metadata.Photoshop?.DisplayedUnitsY || '',
        PhotoshopQuality: metadata.Photoshop?.PhotoshopQuality || 0,
        PhotoshopFormat: metadata.Photoshop?.PhotoshopFormat || '',
        ProgressiveScans: metadata.Photoshop?.ProgressiveScans || '',
        CopyrightFlag: metadata.Photoshop?.CopyrightFlag || false,
        GlobalAngle: metadata.Photoshop?.GlobalAngle || 0,
        GlobalAltitude: metadata.Photoshop?.GlobalAltitude || 0,
        PrintScale: metadata.Photoshop?.PrintScale || 0,
        PixelAspectRatio: metadata.Photoshop?.PixelAspectRatio || 0
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
        ProfileClass: metadata.ICC_Profile?.ProfileClass || '',
        ColorSpaceData: metadata.ICC_Profile?.ColorSpaceData || '',
        ProfileConnectionSpace: metadata.ICC_Profile?.ProfileConnectionSpace || '',
        ProfileDateTime: metadata.ICC_Profile?.ProfileDateTime || '',
        ProfileFileSignature: metadata.ICC_Profile?.ProfileFileSignature || '',
        PrimaryPlatform: metadata.ICC_Profile?.PrimaryPlatform || '',
        CMMFlags: metadata.ICC_Profile?.CMMFlags || '',
        DeviceManufacturer: metadata.ICC_Profile?.DeviceManufacturer || '',
        DeviceModel: metadata.ICC_Profile?.DeviceModel || '',
        DeviceAttributes: metadata.ICC_Profile?.DeviceAttributes || '',
        RenderingIntent: metadata.ICC_Profile?.RenderingIntent || '',
        ConnectionSpaceIlluminant: metadata.ICC_Profile?.ConnectionSpaceIlluminant || '',
        ProfileCreator: metadata.ICC_Profile?.ProfileCreator || '',
        ProfileID: metadata.ICC_Profile?.ProfileID || 0,
        ProfileDescription: metadata.ICC_Profile?.ProfileDescription || '',
        MediaWhitePoint: metadata.ICC_Profile?.MediaWhitePoint || '',
        MediaBlackPoint: metadata.ICC_Profile?.MediaBlackPoint || ''
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
    // Improved error logging
    console.error('Metadata extraction error details:', {
      error: error.message,
      fileName: tempFilePath,
      imageUrl: url
    });
    
    // Clean up more explicitly
    if (et) {
      try {
        await et.end();
      } catch (cleanupError) {
        console.error('Error cleaning up ExifTool:', cleanupError);
      }
    }
    
    throw error;
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (unlinkError) {
        console.error('Error deleting temporary file:', unlinkError);
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

// In the API handler section:

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let et = null;

  try {
    const { url, turnstileToken } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Add timeout for the entire request
    const requestTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 180000); // 3 minutes total timeout
    });

    const processRequest = async () => {
      // Verify CAPTCHA and process image as before...
      const verification = await verifyTurnstileToken(turnstileToken);
      if (!verification.success) {
        throw new Error('Invalid CAPTCHA');
      }

      const imageResponse = await fetch(url, {
        timeout: 30000, // 30 second timeout for fetch
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      // Process image and extract metadata
      const buffer = await imageResponse.buffer();
      return await extractMetadata(buffer, url);
    };

    // Race between request processing and timeout
    const metadata = await Promise.race([processRequest(), requestTimeout]);
    return res.status(200).json(metadata);

  } catch (error) {
    console.error('API error:', {
      message: error.message,
      stack: error.stack,
      url: req.body?.url
    });

    // More specific error handling
    const errorResponse = {
      error: 'Request failed',
      details: error.message,
      code: error.message.includes('timed out') ? 'TIMEOUT_ERROR' : 'PROCESSING_ERROR'
    };

    const statusCode = 
      error.message.includes('timed out') ? 408 :
      error.message.includes('Invalid CAPTCHA') ? 400 :
      error.message.includes('Failed to fetch') ? 404 :
      500;

    return res.status(statusCode).json(errorResponse);

  } finally {
    // Ensure cleanup
    if (et) {
      try {
        await et.end();
      } catch (cleanupError) {
        console.error('Error cleaning up ExifTool:', cleanupError);
      }
    }
  }
}

// Export necessary functions for testing
export {
  extractMetadata,
  verifyTurnstileToken
};
