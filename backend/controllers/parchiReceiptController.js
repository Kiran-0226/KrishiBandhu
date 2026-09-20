const path = require('path');

const Parchi = require('../models/Parchi');

const {
  analyzeParchiReceipt,
} = require('../services/parchiReceiptService');

/*
 * ==========================================
 * Upload Parchi Receipt
 * ==========================================
 *
 * POST
 * /api/parchi/:id/receipt
 *
 * Only the trader associated with the Parchi
 * can upload the transfer receipt.
 *
 * This endpoint DOES NOT mark payment as
 * successful.
 */

const uploadParchiReceipt = async (
  req,
  res,
) => {
  try {
    /*
     * ==========================================
     * Receipt File Check
     * ==========================================
     */

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          'Please upload a payment receipt.',
      });
    }

    /*
     * ==========================================
     * Find Parchi
     * ==========================================
     */

    const parchi =
      await Parchi.findById(
        req.params.id,
      );

    if (!parchi) {
      return res.status(404).json({
        success: false,
        message: 'Parchi not found.',
      });
    }

    /*
     * ==========================================
     * Trader Ownership Check
     * ==========================================
     */

    if (
      req.user.role !== 'trader' ||
      parchi.trader?.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Only the trader associated with this Parchi can upload the receipt.',
      });
    }

    /*
     * ==========================================
     * Payment State Check
     * ==========================================
     *
     * Receipt should normally be uploaded
     * after transfer submission.
     */

    const allowedStatuses = [
      'transfer_submitted',
      'verification_pending',
    ];

    if (
      !allowedStatuses.includes(
        parchi.paymentStatus,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Receipt can only be uploaded after the transfer has been submitted.',
      });
    }

    /*
     * ==========================================
     * Build Public File URL
     * ==========================================
     */

    const storedFileName =
      req.file.filename;

    const fileUrl =
      `/uploads/parchi-receipts/${storedFileName}`;

    /*
     * ==========================================
     * Save Receipt Information
     * ==========================================
     */

    parchi.paymentReceipt = {
      fileName:
        req.file.originalname,

      fileUrl,

      uploadedAt:
        new Date(),

      uploadedBy:
        req.user._id,

      aiVerification: {
        status: 'not_checked',

        extractedAmount:
          null,

        extractedDate:
          null,

        extractedReference:
          null,

        notes:
          'Receipt uploaded. AI verification has not been started.',

        checkedAt:
          null,
      },
    };

    /*
     * ==========================================
     * Update Payment Status
     * ==========================================
     */

    parchi.paymentStatus =
      'verification_pending';

    parchi.status =
      'payment_pending';

    /*
     * ==========================================
     * Save
     * ==========================================
     */

    await parchi.save();

    /*
     * ==========================================
     * Response
     * ==========================================
     */

    return res.status(200).json({
      success: true,

      message:
        'Payment receipt uploaded successfully. Receipt verification is now pending.',

      data: {
        parchiId:
          parchi._id,

        parchiNumber:
          parchi.parchiNumber,

        paymentStatus:
          parchi.paymentStatus,

        paymentReceipt:
          parchi.paymentReceipt,
      },
    });
  } catch (error) {
    console.error(
      'Upload Parchi Receipt Error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to upload payment receipt.',
    });
  }
};

/*
 * ==========================================
 * Verify Parchi Receipt
 * ==========================================
 *
 * POST
 * /api/parchi/:id/receipt/verify
 *
 * Trader/Admin can request verification.
 *
 * IMPORTANT:
 *
 * A successful AI match NEVER means the
 * payment is automatically completed.
 *
 * Farmer confirmation is still required.
 */

const verifyParchiReceipt = async (
  req,
  res,
) => {
  try {
    /*
     * ==========================================
     * Find Parchi
     * ==========================================
     */

    const parchi =
      await Parchi.findById(
        req.params.id,
      )
        .populate(
          'farmer',
          'name email phone location',
        )
        .populate(
          'trader',
          'name email phone location',
        );

    if (!parchi) {
      return res.status(404).json({
        success: false,
        message: 'Parchi not found.',
      });
    }

    /*
     * ==========================================
     * Access Control
     * ==========================================
     */

    const isAdmin =
      req.user.role === 'admin';

    const isTrader =
      req.user.role === 'trader' &&
      parchi.trader?._id?.toString() ===
        req.user._id.toString();

    if (
      !isAdmin &&
      !isTrader
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Only the associated trader or an admin can verify this receipt.',
      });
    }

    /*
     * ==========================================
     * Receipt Check
     * ==========================================
     */

    if (
      !parchi.paymentReceipt?.fileUrl
    ) {
      return res.status(400).json({
        success: false,
        message:
          'No payment receipt has been uploaded.',
      });
    }

    /*
     * ==========================================
     * Payment Status Check
     * ==========================================
     */

    if (
      parchi.paymentStatus !==
      'verification_pending'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'This Parchi is not currently waiting for receipt verification.',
      });
    }

    /*
     * ==========================================
     * Set Processing State
     * ==========================================
     */

    parchi.paymentReceipt
      .aiVerification = {
      status: 'processing',

      extractedAmount:
        null,

      extractedDate:
        null,

      extractedReference:
        null,

      notes:
        'AI receipt verification is in progress.',

      checkedAt:
        null,
    };

    await parchi.save();

    /*
     * ==========================================
     * Resolve Receipt File
     * ==========================================
     */

    const relativeFileUrl =
      parchi.paymentReceipt.fileUrl
        .replace(
          /^\/uploads[\\/]/,
          '',
        );

    const filePath =
      path.join(
        __dirname,
        '..',
        'uploads',
        relativeFileUrl,
      );

    /*
     * ==========================================
     * Run AI Analysis
     * ==========================================
     */

    const result =
      await analyzeParchiReceipt({
        filePath,
        parchi,
      });

    /*
     * ==========================================
     * Save AI Verification
     * ==========================================
     */

    parchi.paymentReceipt
      .aiVerification = {
      status:
        result.status,

      extractedAmount:
        result.extractedAmount,

      extractedDate:
        result.extractedDate
          ? new Date(
              result.extractedDate,
            )
          : null,

      extractedReference:
        result.extractedTransferReference,

      notes:
        result.notes,

      checkedAt:
        new Date(),
    };

    /*
     * ==========================================
     * IMPORTANT
     * ==========================================
     *
     * DO NOT change:
     *
     * paymentStatus
     * status
     * paidAt
     * transaction
     *
     * Farmer confirmation is still required.
     */

    await parchi.save();

    /*
     * ==========================================
     * Response
     * ==========================================
     */

    return res.status(200).json({
      success: true,

      message:
        'Receipt verification completed. Farmer confirmation is still required before payment can be completed.',

      data: {
        verification:
          parchi.paymentReceipt
            .aiVerification,

        checks:
          result.checks,

        paymentStatus:
          parchi.paymentStatus,

        farmerConfirmation:
          parchi.farmerConfirmation,
      },
    });
  } catch (error) {
    console.error(
      'Verify Parchi Receipt Error:',
      error,
    );

    /*
     * ==========================================
     * Save Uncertain State
     * ==========================================
     */

    try {
      const parchi =
        await Parchi.findById(
          req.params.id,
        );

      if (
        parchi &&
        parchi.paymentReceipt
      ) {
        parchi.paymentReceipt
          .aiVerification = {
          status: 'uncertain',

          extractedAmount:
            null,

          extractedDate:
            null,

          extractedReference:
            null,

          notes:
            'AI receipt verification could not be completed. Manual review is required.',

          checkedAt:
            new Date(),
        };

        await parchi.save();
      }
    } catch (
      recoveryError
    ) {
      console.error(
        'Receipt Verification Recovery Error:',
        recoveryError,
      );
    }

    return res.status(500).json({
      success: false,
      message:
        'Receipt verification could not be completed. Manual review is required.',
    });
  }
};

module.exports = {
  uploadParchiReceipt,
  verifyParchiReceipt,
};