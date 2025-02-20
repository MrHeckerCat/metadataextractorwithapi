const { exiftool } = require('exiftool-vendored');
const path = require('path');
const { writeFile, unlink, readFile } = require('fs/promises');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const icc = require('icc');
const jpeg = require('jpeg-js');
const ExifReader = require('exifreader');

let exiftoolProcess = null;

async function getExiftool() {
  if (!exiftoolProcess) {
    console.log('Initializing ExifTool...');
    exiftoolProcess = exiftool;
    console.log('ExifTool initialized successfully');
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
    console.log('Creating temporary file...');
    const tempFileName = `temp-${uuidv4()}${path.extname(url)}`;
    tempFilePath = path.join('/tmp', tempFileName); // Use /tmp directly on Vercel
    await writeFile(tempFilePath, buffer);
    console.log('Temporary file created at:', tempFilePath);

    // Set a timeout for the exiftool operation
    const exifToolTimeout = 30000; // 30 seconds
    const metadataPromise = et.read(tempFilePath);

    console.log('Starting metadata extraction...');
    const metadata = await Promise.race([
      metadataPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('ExifTool operation timed out')), exifToolTimeout)
      )
    ]);
    console.log('Metadata extraction completed');

    // Helper function to get value with N/A default
    const getValue = (obj, key, defaultValue = "N/A") => {
      return obj && obj[key] !== undefined ? obj[key] : defaultValue;
    };

    // Helper function for numeric values
    const getNumValue = (obj, key, defaultValue = 0) => {
      return obj && obj[key] !== undefined ? obj[key] : defaultValue;
    };

    const logAllMetadataFields = (metadata) => {
      console.log('All available metadata fields:');
      Object.keys(metadata).sort().forEach(key => {
        console.log(`${key}: ${typeof metadata[key]} = ${metadata[key]}`);
      });
    };

    console.log('Starting detailed metadata analysis...');
    logAllMetadataFields(metadata);

    const metadataObject = {
      File: {
        Url: url || "N/A",
        FileName: path.basename(url) || "N/A",
        FileSize: getNumValue(metadata, 'FileSize'),
        FileModifyDate: getValue(metadata, 'FileModifyDate'),
        FileAccessDate: getValue(metadata, 'FileAccessDate'),
        FileInodeChangeDate: getValue(metadata, 'FileInodeChangeDate'),
        FileType: getValue(metadata, 'FileType'),
        FileTypeExtension: getValue(metadata, 'FileTypeExtension'),
        MIMEType: getValue(metadata, 'MIMEType'),
        ExifByteOrder: getValue(metadata, 'ExifByteOrder'),
        CurrentIPTCDigest: getValue(metadata, 'CurrentIPTCDigest'),
        ImageWidth: getNumValue(metadata, 'ImageWidth'),
        ImageHeight: getNumValue(metadata, 'ImageHeight'),
        EncodingProcess: getValue(metadata, 'EncodingProcess'),
        BitsPerSample: getNumValue(metadata, 'BitsPerSample'),
        ColorComponents: getNumValue(metadata, 'ColorComponents'),
        YCbCrSubSampling: getValue(metadata, 'YCbCrSubSampling')
      },
      EXIF: {
        Make: getValue(metadata, 'Make'),
        Model: getValue(metadata, 'Model'),
        Orientation: getValue(metadata, 'Orientation'),
        XResolution: getNumValue(metadata, 'XResolution'),
        YResolution: getNumValue(metadata, 'YResolution'),
        ResolutionUnit: getValue(metadata, 'ResolutionUnit'),
        Software: getValue(metadata, 'Software'),
        ModifyDate: getValue(metadata, 'ModifyDate'),
        Artist: getValue(metadata, 'Artist'),
        ExposureTime: getValue(metadata, 'ExposureTime'),
        FNumber: getNumValue(metadata, 'FNumber'),
        ExposureProgram: getValue(metadata, 'ExposureProgram'),
        ISO: getNumValue(metadata, 'ISO'),
        ExifVersion: getValue(metadata, 'ExifVersion'),
        DateTimeOriginal: getValue(metadata, 'DateTimeOriginal'),
        CreateDate: getValue(metadata, 'CreateDate'),
        ShutterSpeedValue: getValue(metadata, 'ShutterSpeedValue'),
        ApertureValue: getNumValue(metadata, 'ApertureValue'),
        ExposureCompensation: getNumValue(metadata, 'ExposureCompensation'),
        MaxApertureValue: getNumValue(metadata, 'MaxApertureValue'),
        MeteringMode: getValue(metadata, 'MeteringMode'),
        LightSource: getValue(metadata, 'LightSource'),
        Flash: getValue(metadata, 'Flash'),
        FocalLength: getValue(metadata, 'FocalLength'),
        ColorSpace: getValue(metadata, 'ColorSpace'),
        ExifImageWidth: getNumValue(metadata, 'ExifImageWidth'),
        ExifImageHeight: getNumValue(metadata, 'ExifImageHeight'),
        FileSource: getValue(metadata, 'FileSource'),
        SceneType: getValue(metadata, 'SceneType'),
        CustomRendered: getValue(metadata, 'CustomRendered'),
        ExposureMode: getValue(metadata, 'ExposureMode'),
        WhiteBalance: getValue(metadata, 'WhiteBalance'),
        SceneCaptureType: getValue(metadata, 'SceneCaptureType'),
        GainControl: getValue(metadata, 'GainControl'),
        Contrast: getValue(metadata, 'Contrast'),
        Saturation: getValue(metadata, 'Saturation'),
        Sharpness: getValue(metadata, 'Sharpness'),
        SubjectDistanceRange: getValue(metadata, 'SubjectDistanceRange'),
        SerialNumber: getNumValue(metadata, 'SerialNumber'),
        LensMake: getValue(metadata, 'LensMake'),
        LensModel: getValue(metadata, 'LensModel'),
        GPSVersionID: getValue(metadata, 'GPSVersionID'),
        GPSLatitudeRef: getValue(metadata, 'GPSLatitudeRef'),
        GPSLatitude: getValue(metadata, 'GPSLatitude'),
        GPSLongitudeRef: getValue(metadata, 'GPSLongitudeRef'),
        GPSLongitude: getValue(metadata, 'GPSLongitude'),
        GPSAltitudeRef: getValue(metadata, 'GPSAltitudeRef'),
        GPSAltitude: getValue(metadata, 'GPSAltitude'),
        Compression: getValue(metadata, 'Compression'),
        ThumbnailOffset: getNumValue(metadata, 'ThumbnailOffset'),
        ThumbnailLength: getNumValue(metadata, 'ThumbnailLength'),
        ThumbnailImage: getValue(metadata, 'ThumbnailImage'),
        ImageUniqueID: getValue(metadata, 'ImageUniqueID'),
        OffsetTime: getValue(metadata, 'OffsetTime'),
        OffsetTimeOriginal: getValue(metadata, 'OffsetTimeOriginal'),
        OffsetTimeDigitized: getValue(metadata, 'OffsetTimeDigitized'),
        SubsecTime: getValue(metadata, 'SubsecTime'),
        SubsecTimeOriginal: getValue(metadata, 'SubsecTimeOriginal'),
        SubsecTimeDigitized: getValue(metadata, 'SubsecTimeDigitized'),
        SensingMethod: getValue(metadata, 'SensingMethod'),
        FocalLengthIn35mmFormat: getValue(metadata, 'FocalLengthIn35mmFormat'),
        DeviceSettingDescription: getValue(metadata, 'DeviceSettingDescription'),
        BodySerialNumber: getValue(metadata, 'BodySerialNumber'),
        LensSpecification: getValue(metadata, 'LensSpecification'),
        LensSerialNumber: getValue(metadata, 'LensSerialNumber'),
        InteropIndex: getValue(metadata, 'InteropIndex'),
        InteropVersion: getValue(metadata, 'InteropVersion'),
      },
      IPTC: {
        SpecialInstructions: getValue(metadata, 'SpecialInstructions'),
        DateCreated: getValue(metadata, 'DateCreated'),
        TimeCreated: getValue(metadata, 'TimeCreated'),
        'By-line': getValue(metadata, 'By-line'),
        Headline: getValue(metadata, 'Headline'),
        Credit: getValue(metadata, 'Credit'),
        CopyrightNotice: getValue(metadata, 'CopyrightNotice'),
        'Caption-Abstract': getValue(metadata, 'Caption-Abstract'),
        ApplicationRecordVersion: getNumValue(metadata, 'ApplicationRecordVersion'),
        ObjectName: getValue(metadata, 'ObjectName'),
        Keywords: getValue(metadata, 'Keywords'),
        Category: getValue(metadata, 'Category'),
        SupplementalCategories: getValue(metadata, 'SupplementalCategories'),
        Province: getValue(metadata, 'Province'),
        Country: getValue(metadata, 'Country'),
        OriginalTransmissionReference: getValue(metadata, 'OriginalTransmissionReference'),
        Source: getValue(metadata, 'Source'),
        Contact: getValue(metadata, 'Contact'),
        Writer: getValue(metadata, 'Writer'),
        Headline: getValue(metadata, 'Headline'),
        Caption: getValue(metadata, 'Caption'),
        Credit: getValue(metadata, 'Credit'),
        Instructions: getValue(metadata, 'Instructions'),
        DateSent: getValue(metadata, 'DateSent'),
        Urgency: getValue(metadata, 'Urgency'),
      },
      XMP: {
        XMPToolkit: getValue(metadata, 'XMPToolkit'),
        ModifyDate: getValue(metadata, 'XMP:ModifyDate'),
        CreateDate: getValue(metadata, 'XMP:CreateDate'),
        CreatorTool: getValue(metadata, 'XMP:CreatorTool'),
        Rating: getNumValue(metadata, 'XMP:Rating'),
        MetadataDate: getValue(metadata, 'XMP:MetadataDate'),
        Format: getValue(metadata, 'XMP:Format'),
        Latitude: getValue(metadata, 'XMP:Latitude'),
        Longitude: getValue(metadata, 'XMP:Longitude'),
        AbsoluteAltitude: getValue(metadata, 'XMP:AbsoluteAltitude'),
        RelativeAltitude: getValue(metadata, 'XMP:RelativeAltitude'),
        GimbalRollDegree: getValue(metadata, 'XMP:GimbalRollDegree'),
        GimbalYawDegree: getNumValue(metadata, 'XMP:GimbalYawDegree'),
        GimbalPitchDegree: getValue(metadata, 'XMP:GimbalPitchDegree'),
        FlightRollDegree: getNumValue(metadata, 'XMP:FlightRollDegree'),
        FlightYawDegree: getNumValue(metadata, 'XMP:FlightYawDegree'),
        FlightPitchDegree: getValue(metadata, 'XMP:FlightPitchDegree'),
        CamReverse: getNumValue(metadata, 'XMP:CamReverse'),
        GimbalReverse: getNumValue(metadata, 'XMP:GimbalReverse'),
        SelfData: getValue(metadata, 'XMP:SelfData'),
        SerialNumber: getNumValue(metadata, 'XMP:SerialNumber'),
        Lens: getValue(metadata, 'XMP:Lens'),
        DistortionCorrectionAlreadyApplied: metadata['XMP:DistortionCorrectionAlreadyApplied'] || false,
        LateralChromaticAberrationCorrectionAlreadyApplied: metadata['XMP:LateralChromaticAberrationCorrectionAlreadyApplied'] || false,
        DateCreated: getValue(metadata, 'XMP:DateCreated'),
        DocumentID: getValue(metadata, 'XMP:DocumentID'),
        OriginalDocumentID: getValue(metadata, 'XMP:OriginalDocumentID'),
        InstanceID: getValue(metadata, 'XMP:InstanceID'),
        Marked: metadata['XMP:Marked'] || false,
        RawFileName: getValue(metadata, 'XMP:RawFileName'),
        Version: getNumValue(metadata, 'XMP:Version'),
        ProcessVersion: getNumValue(metadata, 'XMP:ProcessVersion'),
        WhiteBalance: getValue(metadata, 'XMP:WhiteBalance'),
        ColorTemperature: getNumValue(metadata, 'XMP:ColorTemperature'),
        Tint: getNumValue(metadata, 'XMP:Tint'),
        Saturation: getValue(metadata, 'XMP:Saturation'),
        Sharpness: getNumValue(metadata, 'XMP:Sharpness'),
        LuminanceSmoothing: getNumValue(metadata, 'XMP:LuminanceSmoothing'),
        ColorNoiseReduction: getNumValue(metadata, 'XMP:ColorNoiseReduction'),
        VignetteAmount: getNumValue(metadata, 'XMP:VignetteAmount'),
        ShadowTint: getNumValue(metadata, 'XMP:ShadowTint'),
        RedHue: getNumValue(metadata, 'XMP:RedHue'),
        RedSaturation: getNumValue(metadata, 'XMP:RedSaturation'),
        GreenHue: getNumValue(metadata, 'XMP:GreenHue'),
        GreenSaturation: getNumValue(metadata, 'XMP:GreenSaturation'),
        BlueHue: getNumValue(metadata, 'XMP:BlueHue'),
        BlueSaturation: getNumValue(metadata, 'XMP:BlueSaturation'),
        Vibrance: getValue(metadata, 'XMP:Vibrance'),
        HueAdjustmentRed: getNumValue(metadata, 'XMP:HueAdjustmentRed'),
        HueAdjustmentOrange: getNumValue(metadata, 'XMP:HueAdjustmentOrange'),
        HueAdjustmentYellow: getNumValue(metadata, 'XMP:HueAdjustmentYellow'),
        HueAdjustmentGreen: getNumValue(metadata, 'XMP:HueAdjustmentGreen'),
        HueAdjustmentAqua: getNumValue(metadata, 'XMP:HueAdjustmentAqua'),
        HueAdjustmentBlue: getNumValue(metadata, 'XMP:HueAdjustmentBlue'),
        HueAdjustmentPurple: getNumValue(metadata, 'XMP:HueAdjustmentPurple'),
        HueAdjustmentMagenta: getNumValue(metadata, 'XMP:HueAdjustmentMagenta'),
        SaturationAdjustmentRed: getNumValue(metadata, 'XMP:SaturationAdjustmentRed'),
        SaturationAdjustmentOrange: getNumValue(metadata, 'XMP:SaturationAdjustmentOrange'),
        SaturationAdjustmentYellow: getNumValue(metadata, 'XMP:SaturationAdjustmentYellow'),
        SaturationAdjustmentGreen: getNumValue(metadata, 'XMP:SaturationAdjustmentGreen'),
        SaturationAdjustmentAqua: getNumValue(metadata, 'XMP:SaturationAdjustmentAqua'),
        SaturationAdjustmentBlue: getNumValue(metadata, 'XMP:SaturationAdjustmentBlue'),
        SaturationAdjustmentPurple: getNumValue(metadata, 'XMP:SaturationAdjustmentPurple'),
        SaturationAdjustmentMagenta: getNumValue(metadata, 'XMP:SaturationAdjustmentMagenta'),
        LuminanceAdjustmentRed: getNumValue(metadata, 'XMP:LuminanceAdjustmentRed'),
        LuminanceAdjustmentOrange: getNumValue(metadata, 'XMP:LuminanceAdjustmentOrange'),
        LuminanceAdjustmentYellow: getNumValue(metadata, 'XMP:LuminanceAdjustmentYellow'),
        LuminanceAdjustmentGreen: getNumValue(metadata, 'XMP:LuminanceAdjustmentGreen'),
        LuminanceAdjustmentAqua: getNumValue(metadata, 'XMP:LuminanceAdjustmentAqua'),
        LuminanceAdjustmentBlue: getNumValue(metadata, 'XMP:LuminanceAdjustmentBlue'),
        LuminanceAdjustmentPurple: getNumValue(metadata, 'XMP:LuminanceAdjustmentPurple'),
        LuminanceAdjustmentMagenta: getNumValue(metadata, 'XMP:LuminanceAdjustmentMagenta'),
        SplitToningShadowHue: getNumValue(metadata, 'XMP:SplitToningShadowHue'),
        SplitToningShadowSaturation: getNumValue(metadata, 'XMP:SplitToningShadowSaturation'),
        SplitToningHighlightHue: getNumValue(metadata, 'XMP:SplitToningHighlightHue'),
        SplitToningHighlightSaturation: getNumValue(metadata, 'XMP:SplitToningHighlightSaturation'),
        SplitToningBalance: getNumValue(metadata, 'XMP:SplitToningBalance'),
        ParametricShadows: getNumValue(metadata, 'XMP:ParametricShadows'),
        ParametricDarks: getNumValue(metadata, 'XMP:ParametricDarks'),
        ParametricLights: getNumValue(metadata, 'XMP:ParametricLights'),
        ParametricHighlights: getNumValue(metadata, 'XMP:ParametricHighlights'),
        ParametricShadowSplit: getNumValue(metadata, 'XMP:ParametricShadowSplit'),
        ParametricMidtoneSplit: getNumValue(metadata, 'XMP:ParametricMidtoneSplit'),
        ParametricHighlightSplit: getNumValue(metadata, 'XMP:ParametricHighlightSplit'),
        SharpenRadius: getValue(metadata, 'XMP:SharpenRadius'),
        SharpenDetail: getNumValue(metadata, 'XMP:SharpenDetail'),
        SharpenEdgeMasking: getNumValue(metadata, 'XMP:SharpenEdgeMasking'),
        PostCropVignetteAmount: getNumValue(metadata, 'XMP:PostCropVignetteAmount'),
        GrainAmount: getNumValue(metadata, 'XMP:GrainAmount'),
        LuminanceNoiseReductionDetail: getNumValue(metadata, 'XMP:LuminanceNoiseReductionDetail'),
        ColorNoiseReductionDetail: getNumValue(metadata, 'XMP:ColorNoiseReductionDetail'),
        LuminanceNoiseReductionContrast: getNumValue(metadata, 'XMP:LuminanceNoiseReductionContrast'),
        ColorNoiseReductionSmoothness: getNumValue(metadata, 'XMP:ColorNoiseReductionSmoothness'),
        Creator: getValue(metadata, 'XMP:Creator'),
        CreatorWorkEmail: getValue(metadata, 'XMP:CreatorWorkEmail'),
        CreatorWorkURL: getValue(metadata, 'XMP:CreatorWorkURL'),
        CreatorContactInfo: getValue(metadata, 'XMP:CreatorContactInfo'),
        CreatorCity: getValue(metadata, 'XMP:CreatorCity'),
        CreatorCountry: getValue(metadata, 'XMP:CreatorCountry'),
        CreatorAddress: getValue(metadata, 'XMP:CreatorAddress'),
        CreatorPostalCode: getValue(metadata, 'XMP:CreatorPostalCode'),
        CreatorRegion: getValue(metadata, 'XMP:CreatorRegion'),
        ArtworkOrObject: getValue(metadata, 'XMP:ArtworkOrObject'),
        LocationShown: getValue(metadata, 'XMP:LocationShown'),
        LocationCreated: getValue(metadata, 'XMP:LocationCreated'),
        RightsUsageTerms: getValue(metadata, 'XMP:RightsUsageTerms'),
        WebStatement: getValue(metadata, 'XMP:WebStatement'),
        LicensorURL: getValue(metadata, 'XMP:LicensorURL'),
        LicensorName: getValue(metadata, 'XMP:LicensorName'),
        LicensorID: getValue(metadata, 'XMP:LicensorID'),
        LicensorCity: getValue(metadata, 'XMP:LicensorCity'),
        LicensorCountry: getValue(metadata, 'XMP:LicensorCountry'),
        LicensorEmail: getValue(metadata, 'XMP:LicensorEmail'),
        LicensorTelephone: getValue(metadata, 'XMP:LicensorTelephone'),
        LicensorPostalCode: getValue(metadata, 'XMP:LicensorPostalCode'),
        LicensorRegion: getValue(metadata, 'XMP:LicensorRegion'),
      },
      Photoshop: {
        XResolution: getNumValue(metadata, 'Photoshop:XResolution'),
        DisplayedUnitsX: getValue(metadata, 'Photoshop:DisplayedUnitsX'),
        YResolution: getNumValue(metadata, 'Photoshop:YResolution'),
        DisplayedUnitsY: getValue(metadata, 'Photoshop:DisplayedUnitsY'),
        PhotoshopQuality: getNumValue(metadata, 'Photoshop:PhotoshopQuality'),
        PhotoshopFormat: getValue(metadata, 'Photoshop:PhotoshopFormat'),
        ProgressiveScans: getValue(metadata, 'Photoshop:ProgressiveScans'),
        CopyrightFlag: metadata['Photoshop:CopyrightFlag'] || false,
        GlobalAngle: getNumValue(metadata, 'Photoshop:GlobalAngle'),
        GlobalAltitude: getNumValue(metadata, 'Photoshop:GlobalAltitude'),
        PrintScale: getNumValue(metadata, 'Photoshop:PrintScale'),
        PixelAspectRatio: getNumValue(metadata, 'Photoshop:PixelAspectRatio'),
        AuthorsPosition: getValue(metadata, 'Photoshop:AuthorsPosition'),
        CaptionWriter: getValue(metadata, 'Photoshop:CaptionWriter'),
        Category: getValue(metadata, 'Photoshop:Category'),
        City: getValue(metadata, 'Photoshop:City'),
        Country: getValue(metadata, 'Photoshop:Country'),
        DateCreated: getValue(metadata, 'Photoshop:DateCreated'),
        Headline: getValue(metadata, 'Photoshop:Headline'),
        Instructions: getValue(metadata, 'Photoshop:Instructions'),
        Source: getValue(metadata, 'Photoshop:Source'),
        State: getValue(metadata, 'Photoshop:State'),
        SupplementalCategories: getValue(metadata, 'Photoshop:SupplementalCategories'),
        TransmissionReference: getValue(metadata, 'Photoshop:TransmissionReference'),
        Urgency: getValue(metadata, 'Photoshop:Urgency'),
      },
      ICC_Profile: {
        ProfileCMMType: getValue(metadata, 'ICC_Profile:ProfileCMMType'),
        ProfileVersion: getValue(metadata, 'ICC_Profile:ProfileVersion'),
        ProfileClass: getValue(metadata, 'ICC_Profile:ProfileClass'),
        ColorSpaceData: getValue(metadata, 'ICC_Profile:ColorSpaceData'),
        ProfileConnectionSpace: getValue(metadata, 'ICC_Profile:ProfileConnectionSpace'),
        ProfileDateTime: getValue(metadata, 'ICC_Profile:ProfileDateTime'),
        ProfileFileSignature: getValue(metadata, 'ICC_Profile:ProfileFileSignature'),
        PrimaryPlatform: getValue(metadata, 'ICC_Profile:PrimaryPlatform'),
        CMMFlags: getValue(metadata, 'ICC_Profile:CMMFlags'),
        DeviceManufacturer: getValue(metadata, 'ICC_Profile:DeviceManufacturer'),
        DeviceModel: getValue(metadata, 'ICC_Profile:DeviceModel'),
        DeviceAttributes: getValue(metadata, 'ICC_Profile:DeviceAttributes'),
        RenderingIntent: getValue(metadata, 'ICC_Profile:RenderingIntent'),
        ConnectionSpaceIlluminant: getValue(metadata, 'ICC_Profile:ConnectionSpaceIlluminant'),
        ProfileCreator: getValue(metadata, 'ICC_Profile:ProfileCreator'),
        ProfileID: getNumValue(metadata, 'ICC_Profile:ProfileID'),
        ProfileDescription: getValue(metadata, 'ICC_Profile:ProfileDescription'),
        MediaWhitePoint: getValue(metadata, 'ICC_Profile:MediaWhitePoint'),
        MediaBlackPoint: getValue(metadata, 'ICC_Profile:MediaBlackPoint'),
        RedTRC: getValue(metadata, 'ICC_Profile:RedTRC'),
        GreenTRC: getValue(metadata, 'ICC_Profile:GreenTRC'),
        BlueTRC: getValue(metadata, 'ICC_Profile:BlueTRC'),
        RedMatrixColumn: getValue(metadata, 'ICC_Profile:RedMatrixColumn'),
        GreenMatrixColumn: getValue(metadata, 'ICC_Profile:GreenMatrixColumn'),
        BlueMatrixColumn: getValue(metadata, 'ICC_Profile:BlueMatrixColumn')
      },
      Composite: {
        Aperture: getNumValue(metadata, 'Composite:Aperture'),
        ImageSize: getValue(metadata, 'Composite:ImageSize'),
        Megapixels: getNumValue(metadata, 'Composite:Megapixels'),
        ShutterSpeed: getValue(metadata, 'Composite:ShutterSpeed'),
        GPSAltitude: getValue(metadata, 'Composite:GPSAltitude'),
        GPSLatitude: getValue(metadata, 'Composite:GPSLatitude'),
        GPSLongitude: getValue(metadata, 'Composite:GPSLongitude'),
        DateTimeCreated: getValue(metadata, 'Composite:DateTimeCreated'),
        FocalLength35efl: getValue(metadata, 'Composite:FocalLength35efl'),
        GPSPosition: getValue(metadata, 'Composite:GPSPosition'),
        LightValue: getNumValue(metadata, 'Composite:LightValue')
      },
      CameraSettings: {
        CameraType: getValue(metadata, 'CameraType'),
        FirmwareVersion: getValue(metadata, 'FirmwareVersion'),
        ShutterCount: getNumValue(metadata, 'ShutterCount'),
        BatteryLevel: getValue(metadata, 'BatteryLevel'),
        ImageStabilization: getValue(metadata, 'ImageStabilization'),
        AutoFocusPoints: getValue(metadata, 'AFPoints'),
        AFPointsInFocus: getValue(metadata, 'AFPointsInFocus'),
        FocusMode: getValue(metadata, 'FocusMode'),
        FocusDistance: getValue(metadata, 'FocusDistance'),
        DriveMode: getValue(metadata, 'DriveMode'),
        ShootingMode: getValue(metadata, 'ShootingMode'),
        BracketMode: getValue(metadata, 'BracketMode'),
        ImageQuality: getValue(metadata, 'Quality'),
        NoiseReduction: getValue(metadata, 'NoiseReduction'),
        FlashMode: getValue(metadata, 'FlashMode'),
        FlashType: getValue(metadata, 'FlashType'),
        FlashExposureComp: getValue(metadata, 'FlashExposureComp'),
        WBMode: getValue(metadata, 'WBMode'),
        WBTemperature: getNumValue(metadata, 'WBTemperature'),
        LensID: getValue(metadata, 'LensID'),
        LensFirmware: getValue(metadata, 'LensFirmware'),
        MinFocalLength: getValue(metadata, 'MinFocalLength'),
        MaxFocalLength: getValue(metadata, 'MaxFocalLength'),
        MaxAperture: getValue(metadata, 'MaxAperture'),
        MinAperture: getValue(metadata, 'MinAperture'),
        ImageFormat: getValue(metadata, 'ImageFormat'),
        SensorSize: getValue(metadata, 'SensorSize'),
        SensorType: getValue(metadata, 'SensorType')
      },
      ColorProfile: {
        ProfileName: getValue(metadata, 'ProfileName'),
        ProfileCopyright: getValue(metadata, 'ProfileCopyright'),
        ProfileCalibrationDateTime: getValue(metadata, 'ProfileCalibrationDateTime'),
        GamutTag: getValue(metadata, 'GamutTag'),
        DeviceModelDesc: getValue(metadata, 'DeviceModelDesc'),
        ViewingCondDesc: getValue(metadata, 'ViewingCondDesc'),
        Luminance: getValue(metadata, 'Luminance'),
        MeasurementObserver: getValue(metadata, 'MeasurementObserver'),
        MeasurementBacking: getValue(metadata, 'MeasurementBacking'),
        MeasurementGeometry: getValue(metadata, 'MeasurementGeometry'),
        MeasurementFlare: getValue(metadata, 'MeasurementFlare'),
        MeasurementIlluminant: getValue(metadata, 'MeasurementIlluminant'),
        TechnologyInformation: getValue(metadata, 'TechnologyInformation'),
        ChromaticAdaptation: getValue(metadata, 'ChromaticAdaptation'),
        ColorimetricIntent: getValue(metadata, 'ColorimetricIntent')
      },
      GPSDetailed: {
        GPSVersionID: getValue(metadata, 'GPSVersionID'),
        GPSLatitudeRef: getValue(metadata, 'GPSLatitudeRef'),
        GPSLatitudeDegrees: getValue(metadata, 'GPSLatitude'),
        GPSLongitudeRef: getValue(metadata, 'GPSLongitudeRef'),
        GPSLongitudeDegrees: getValue(metadata, 'GPSLongitude'),
        GPSAltitudeRef: getValue(metadata, 'GPSAltitudeRef'),
        GPSAltitudeMeter: getValue(metadata, 'GPSAltitude'),
        GPSTimeStamp: getValue(metadata, 'GPSTimeStamp'),
        GPSDateStamp: getValue(metadata, 'GPSDateStamp'),
        GPSSatellites: getValue(metadata, 'GPSSatellites'),
        GPSStatus: getValue(metadata, 'GPSStatus'),
        GPSMeasureMode: getValue(metadata, 'GPSMeasureMode'),
        GPSDOP: getValue(metadata, 'GPSDOP'),
        GPSSpeedRef: getValue(metadata, 'GPSSpeedRef'),
        GPSSpeed: getValue(metadata, 'GPSSpeed'),
        GPSTrackRef: getValue(metadata, 'GPSTrackRef'),
        GPSTrack: getValue(metadata, 'GPSTrack'),
        GPSImgDirectionRef: getValue(metadata, 'GPSImgDirectionRef'),
        GPSImgDirection: getValue(metadata, 'GPSImgDirection'),
        GPSMapDatum: getValue(metadata, 'GPSMapDatum'),
        GPSDestLatitudeRef: getValue(metadata, 'GPSDestLatitudeRef'),
        GPSDestLatitude: getValue(metadata, 'GPSDestLatitude'),
        GPSDestLongitudeRef: getValue(metadata, 'GPSDestLongitudeRef'),
        GPSDestLongitude: getValue(metadata, 'GPSDestLongitude'),
        GPSDestBearingRef: getValue(metadata, 'GPSDestBearingRef'),
        GPSDestBearing: getValue(metadata, 'GPSDestBearing'),
        GPSDestDistanceRef: getValue(metadata, 'GPSDestDistanceRef'),
        GPSDestDistance: getValue(metadata, 'GPSDestDistance'),
        GPSProcessingMethod: getValue(metadata, 'GPSProcessingMethod'),
        GPSAreaInformation: getValue(metadata, 'GPSAreaInformation'),
        GPSDifferential: getValue(metadata, 'GPSDifferential'),
        GPSHPositioningError: getValue(metadata, 'GPSHPositioningError')
      },
      Rights: {
        Copyright: getValue(metadata, 'Copyright'),
        CopyrightNotice: getValue(metadata, 'CopyrightNotice'),
        CopyrightStatus: getValue(metadata, 'CopyrightStatus'),
        CopyrightFlag: getValue(metadata, 'CopyrightFlag'),
        RightsUsageTerms: getValue(metadata, 'RightsUsageTerms'),
        WebStatement: getValue(metadata, 'WebStatement'),
        LicenseType: getValue(metadata, 'LicenseType'),
        LicenseURL: getValue(metadata, 'LicenseURL'),
        RightsOwner: getValue(metadata, 'RightsOwner'),
        CreatorContactInfo: getValue(metadata, 'CreatorContactInfo'),
        CreatorWorkURL: getValue(metadata, 'CreatorWorkURL'),
        Attribution: getValue(metadata, 'Attribution'),
        AttributionURL: getValue(metadata, 'AttributionURL'),
        ContentProviderName: getValue(metadata, 'ContentProviderName'),
        ContentProviderID: getValue(metadata, 'ContentProviderID'),
        CopyrightOwnerID: getValue(metadata, 'CopyrightOwnerID'),
        CopyrightOwnerName: getValue(metadata, 'CopyrightOwnerName'),
        UsageRights: getValue(metadata, 'UsageRights'),
        UsageTerms: getValue(metadata, 'UsageTerms'),
        Restrictions: getValue(metadata, 'Restrictions'),
        ExpirationDate: getValue(metadata, 'ExpirationDate'),
        LicenseEndDate: getValue(metadata, 'LicenseEndDate'),
        TermsAndConditionsURL: getValue(metadata, 'TermsAndConditionsURL')
      }
    };

    // Log the raw metadata for debugging
    console.log('Raw metadata:', JSON.stringify(metadata, null, 2));

    return metadataObject;

  } catch (error) {
    console.error('Metadata extraction error:', error);
    throw error;
  } finally {
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
        console.log('Temporary file cleaned up');
      } catch (unlinkError) {
        console.error('Error deleting temporary file:', unlinkError);
      }
    }
  }
}

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let et = null;

  try {
    const { url, turnstileToken } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Reduce timeout to 50 seconds to ensure we complete before Vercel's 60s limit
    const requestTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), 50000);
    });

    const processRequest = async () => {
      const verification = await verifyTurnstileToken(turnstileToken);
      if (!verification.success) {
        throw new Error('Invalid CAPTCHA');
      }

      const imageResponse = await fetch(url, {
        timeout: 10000, // Reduce fetch timeout to 10 seconds
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
      }

      const arrayBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return await extractMetadata(buffer, url);
    };

    const metadata = await Promise.race([processRequest(), requestTimeout]);
    return res.status(200).json(metadata);

  } catch (error) {
    console.error('API error:', {
      message: error.message,
      stack: error.stack,
      url: req.body?.url
    });

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
    if (et) {
      try {
        await et.end();
      } catch (cleanupError) {
        console.error('Error cleaning up ExifTool:', cleanupError);
      }
    }
  }
};

module.exports = {
  extractMetadata,
  verifyTurnstileToken,
  default: handler,
  config: {
    api: {
      bodyParser: {
        sizeLimit: '4mb',
      },
      responseLimit: false,
      maxDuration: 60
    }
  }
};
