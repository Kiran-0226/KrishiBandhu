const {
  analyzeCropImage,
} = require('../services/aiImageService');

const analyzeImage = async (
  req,
  res,
) => {
  try {
    const {
      image,
      mimeType,
      marketId,
    } = req.body;

    // ==========================================
    // Validate image
    // ==========================================

    if (
      !image ||
      typeof image !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'A valid image is required.',
      });
    }

    // ==========================================
    // Validate MIME type
    // ==========================================

    if (
      !mimeType ||
      typeof mimeType !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Image MIME type is required.',
      });
    }

    // ==========================================
    // Remove Data URL prefix if present
    // ==========================================

    let imageBase64 = image;

    if (
      image.includes(
        'base64,',
      )
    ) {
      imageBase64 =
        image.split(
          'base64,',
        )[1];
    }

    // ==========================================
    // Basic Base64 validation
    // ==========================================

    if (
      !imageBase64 ||
      imageBase64.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Image data is empty.',
      });
    }

    // ==========================================
    // Approximate image size
    // ==========================================

    const estimatedBytes =
      Math.floor(
        (imageBase64.length *
          3) /
          4,
      );

    const maxBytes =
      12 * 1024 * 1024;

    if (
      estimatedBytes >
      maxBytes
    ) {
      return res.status(413).json({
        success: false,
        message:
          'Image is too large. Maximum supported size is 12MB.',
      });
    }

    // ==========================================
    // Analyze image
    // ==========================================

    console.log('');
    console.log(
      '========================================',
    );

    console.log(
      '📸 Crop Image Analysis Request',
    );

    console.log(
      '========================================',
    );

    console.log(
      'MIME type:',
      mimeType,
    );

    console.log(
      'Image size:',
      `${(
        estimatedBytes /
        1024 /
        1024
      ).toFixed(2)} MB`,
    );

    console.log(
      'Market ID:',
      marketId || 'Not provided',
    );

    const result =
      await analyzeCropImage({
        imageBase64,
        mimeType,
        marketId,
      });

    // ==========================================
    // Success
    // ==========================================

    return res.status(200).json({
      success: true,

      message:
        'Crop image analyzed successfully.',

      analysis:
        result.analysis,

      crop:
        result.crop,

      qualityScore:
        result.qualityScore,

      marketData:
        result.marketData,
    });
  } catch (error) {
    // ==========================================
    // IMPORTANT:
    // Print the REAL backend error
    // ==========================================

    console.error('');
    console.error(
      '========================================',
    );

    console.error(
      '❌ CROP IMAGE ANALYSIS ERROR',
    );

    console.error(
      '========================================',
    );

    console.error(
      'Message:',
      error.message,
    );

    console.error(
      'Name:',
      error.name,
    );

    console.error(
      'Stack:',
      error.stack,
    );

    console.error(
      '========================================',
    );

    return res.status(500).json({
      success: false,

      message:
        'Unable to analyze the crop image.',

      /*
       * TEMPORARY DEBUG INFORMATION
       *
       * We will remove this once
       * the issue is fixed.
       */

      error:
        error.message,
    });
  }
};

module.exports = {
  analyzeImage,
};