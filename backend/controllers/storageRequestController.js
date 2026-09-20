const mongoose = require('mongoose');

const StorageRequest = require('../models/StorageRequest');
const StorageFacility = require('../models/StorageFacility');

// ==========================================
// UNIT CONVERSION
// ==========================================

const convertToKg = (quantity, unit) => {
  const value = Number(quantity);

  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  switch (unit) {
    case 'kg':
      return value;

    case 'quintal':
      return value * 100;

    case 'ton':
      return value * 1000;

    default:
      return 0;
  }
};

const convertFromKg = (quantityInKg, unit) => {
  const value = Number(quantityInKg);

  if (!Number.isFinite(value)) {
    return 0;
  }

  switch (unit) {
    case 'kg':
      return value;

    case 'quintal':
      return value / 100;

    case 'ton':
      return value / 1000;

    default:
      return value;
  }
};

// ==========================================
// VALIDATE START DATE
// ==========================================

const isValidStartDate = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  // Allow today and future dates.
  // Compare only calendar dates.
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  date.setHours(0, 0, 0, 0);

  return date >= today;
};

// ==========================================
// CALCULATE STORAGE COST
// ==========================================

const calculateStorageCost = (
  quantityInKg,
  facility,
  durationMonths,
) => {
  const quantityInTon = quantityInKg / 1000;

  const monthlyRate =
    Number(
      facility?.storageCharges?.amount || 0,
    );

  const monthlyCost =
    quantityInTon * monthlyRate;

  const totalCost =
    monthlyCost * Number(durationMonths);

  return {
    quantityInTon,
    monthlyCost,
    totalCost,
  };
};

// ==========================================
// CREATE STORAGE REQUEST
// ==========================================

const createStorageRequest = async (
  req,
  res,
) => {
  try {
    const {
      storageFacility,
      crop,
      quantity,
      unit = 'kg',
      startDate,
      durationMonths,
      notes = '',
    } = req.body;

    // ------------------------------------------
    // Basic validation
    // ------------------------------------------

    if (!storageFacility) {
      return res.status(400).json({
        success: false,
        message:
          'Storage facility is required.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(
      storageFacility,
    )) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid storage facility ID.',
      });
    }

    if (!crop || !String(crop).trim()) {
      return res.status(400).json({
        success: false,
        message:
          'Crop is required.',
      });
    }

    const numericQuantity =
      Number(quantity);

    if (
      !Number.isFinite(
        numericQuantity,
      ) ||
      numericQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Quantity must be greater than zero.',
      });
    }

    if (
      !['kg', 'quintal', 'ton'].includes(
        unit,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid quantity unit.',
      });
    }

    const numericDuration =
      Number(durationMonths);

    if (
      !Number.isInteger(
        numericDuration,
      ) ||
      numericDuration < 1 ||
      numericDuration > 24
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Duration must be between 1 and 24 months.',
      });
    }

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message:
          'Storage start date is required.',
      });
    }

    if (!isValidStartDate(startDate)) {
      return res.status(400).json({
        success: false,
        message:
          'Storage start date cannot be in the past.',
      });
    }

    // ------------------------------------------
    // Convert quantity to KG
    // ------------------------------------------

    const quantityInKg =
      convertToKg(
        numericQuantity,
        unit,
      );

    if (quantityInKg <= 0) {
      return res.status(400).json({
        success: false,
        message:
          'Unable to calculate quantity in kilograms.',
      });
    }

    // ------------------------------------------
    // Find storage facility
    // ------------------------------------------

    const facility =
      await StorageFacility.findOne({
        _id: storageFacility,
        isActive: true,
      });

    if (!facility) {
      return res.status(404).json({
        success: false,
        message:
          'Storage facility not found or inactive.',
      });
    }

    // ------------------------------------------
    // Check crop suitability
    // ------------------------------------------

    const requestedCrop =
      String(crop).trim();

    const cropSupported =
      Array.isArray(
        facility.suitableCrops,
      ) &&
      facility.suitableCrops.some(
        (supportedCrop) =>
          String(
            supportedCrop,
          )
            .trim()
            .toLowerCase() ===
          requestedCrop.toLowerCase(),
      );

    if (!cropSupported) {
      return res.status(400).json({
        success: false,
        message:
          `${requestedCrop} is not listed as a suitable crop for this storage facility.`,
      });
    }

    // ------------------------------------------
    // Check available capacity
    // ------------------------------------------

    const requestedQuantityInTon =
      quantityInKg / 1000;

    const availableCapacityInTon =
      Number(
        facility.availableCapacity || 0,
      );

    if (
      requestedQuantityInTon >
      availableCapacityInTon
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Insufficient available capacity. Only ${availableCapacityInTon} ton is currently available.`,
      });
    }

    // ------------------------------------------
    // Prevent duplicate active requests
    // ------------------------------------------

    const existingRequest =
      await StorageRequest.findOne({
        farmer: req.user._id,
        storageFacility,
        crop: requestedCrop,
        status: {
          $in: [
            'pending',
            'approved',
          ],
        },
      });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message:
          'You already have a pending or approved storage request for this crop and facility.',
        data: existingRequest,
      });
    }

    // ------------------------------------------
    // Calculate estimated cost
    // ------------------------------------------

    const {
      monthlyCost,
      totalCost,
    } = calculateStorageCost(
      quantityInKg,
      facility,
      numericDuration,
    );

    // ------------------------------------------
    // Create request
    // ------------------------------------------

    const storageRequest =
      await StorageRequest.create({
        farmer: req.user._id,

        storageFacility:
          facility._id,

        crop: requestedCrop,

        quantity:
          numericQuantity,

        unit,

        quantityInKg,

        startDate:
          new Date(startDate),

        durationMonths:
          numericDuration,

        notes:
          String(notes || '').trim(),

        estimatedMonthlyCost:
          monthlyCost,

        estimatedTotalCost:
          totalCost,

        status: 'pending',

        requestedAt:
          new Date(),
      });

    // ------------------------------------------
    // Populate response
    // ------------------------------------------

    const populatedRequest =
      await StorageRequest.findById(
        storageRequest._id,
      )
        .populate(
          'farmer',
          'name email phone role location',
        )
        .populate(
          'storageFacility',
        );

    return res.status(201).json({
      success: true,
      message:
        'Storage request created successfully.',
      data: populatedRequest,
    });
  } catch (error) {
    console.error(
      '==========================================',
    );

    console.error(
      'Create Storage Request Error:',
      error,
    );

    console.error(
      'ERROR MESSAGE:',
      error.message,
    );

    console.error(
      'ERROR NAME:',
      error.name,
    );

    console.error(
      'ERROR STACK:',
      error.stack,
    );

    if (error.errors) {
      console.error(
        'VALIDATION ERRORS:',
        Object.keys(
          error.errors,
        ).reduce(
          (result, field) => {
            result[field] =
              error.errors[field]
                .message;

            return result;
          },
          {},
        ),
      );
    }

    console.error(
      '==========================================',
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to create storage request.',
      error:
        process.env.NODE_ENV ===
        'development'
          ? error.message
          : undefined,
      details:
        process.env.NODE_ENV ===
          'development' &&
        error.errors
          ? Object.fromEntries(
              Object.entries(
                error.errors,
              ).map(
                ([
                  field,
                  validationError,
                ]) => [
                  field,
                  validationError.message,
                ],
              ),
            )
          : undefined,
    });
  }
};

// ==========================================
// GET MY STORAGE REQUESTS
// ==========================================

const getMyStorageRequests = async (
  req,
  res,
) => {
  try {
    const requests =
      await StorageRequest.find({
        farmer: req.user._id,
      })
        .populate(
          'storageFacility',
        )
        .populate(
          'reviewedBy',
          'name email role',
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error(
      'Get My Storage Requests Error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to fetch your storage requests.',
    });
  }
};

// ==========================================
// GET ALL STORAGE REQUESTS
// ==========================================

const getAllStorageRequests = async (
  req,
  res,
) => {
  try {
    const {
      status,
      district,
      type,
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    let requests =
      await StorageRequest.find(
        filter,
      )
        .populate(
          'farmer',
          'name email phone role location',
        )
        .populate(
          'storageFacility',
        )
        .populate(
          'reviewedBy',
          'name email role',
        )
        .sort({
          createdAt: -1,
        });

    // ------------------------------------------
    // Optional district filter
    // ------------------------------------------

    if (district) {
      requests =
        requests.filter(
          (request) =>
            request
              .storageFacility
              ?.location
              ?.district
              ?.toLowerCase() ===
            String(
              district,
            ).toLowerCase(),
        );
    }

    // ------------------------------------------
    // Optional facility type filter
    // ------------------------------------------

    if (type) {
      requests =
        requests.filter(
          (request) =>
            request
              .storageFacility
              ?.type === type,
        );
    }

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error(
      'Get All Storage Requests Error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to fetch storage requests.',
    });
  }
};

// ==========================================
// GET STORAGE REQUEST BY ID
// ==========================================

const getStorageRequestById =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid storage request ID.',
        });
      }

      const request =
        await StorageRequest.findById(
          id,
        )
          .populate(
            'farmer',
            'name email phone role location',
          )
          .populate(
            'storageFacility',
          )
          .populate(
            'reviewedBy',
            'name email role',
          );

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            'Storage request not found.',
        });
      }

      // ----------------------------------------
      // Access control
      // ----------------------------------------

      const isOwner =
        request.farmer?._id?.toString() ===
        req.user._id.toString();

      const isAdmin =
        req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message:
            'You are not authorized to view this storage request.',
        });
      }

      return res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error) {
      console.error(
        'Get Storage Request Error:',
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch storage request.',
      });
    }
  };

// ==========================================
// CANCEL STORAGE REQUEST
// ==========================================

const cancelStorageRequest =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid storage request ID.',
        });
      }

      const request =
        await StorageRequest.findOne({
          _id: id,
          farmer: req.user._id,
        });

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            'Storage request not found.',
        });
      }

      if (
        request.status !== 'pending'
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Only pending storage requests can be cancelled.',
        });
      }

      request.status =
        'cancelled';

      request.adminNote =
        'Cancelled by farmer.';

      await request.save();

      return res.status(200).json({
        success: true,
        message:
          'Storage request cancelled successfully.',
        data: request,
      });
    } catch (error) {
      console.error(
        'Cancel Storage Request Error:',
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          'Failed to cancel storage request.',
      });
    }
  };

// ==========================================
// UPDATE STORAGE REQUEST STATUS
// ADMIN ONLY
// ==========================================

const updateStorageRequestStatus =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      const {
        status,
        adminNote = '',
      } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          id,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid storage request ID.',
        });
      }

      const allowedStatuses = [
        'approved',
        'rejected',
        'completed',
      ];

      if (
        !allowedStatuses.includes(
          status,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid status. Allowed values: approved, rejected, completed.',
        });
      }

      const request =
        await StorageRequest.findById(
          id,
        );

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            'Storage request not found.',
        });
      }

      // ----------------------------------------
      // APPROVE
      // ----------------------------------------

      if (status === 'approved') {
        if (
          request.status !== 'pending'
        ) {
          return res.status(400).json({
            success: false,
            message:
              'Only pending storage requests can be approved.',
          });
        }

        const facility =
          await StorageFacility.findOne({
            _id:
              request.storageFacility,
            isActive: true,
          });

        if (!facility) {
          return res.status(404).json({
            success: false,
            message:
              'Storage facility is no longer active.',
          });
        }

        const requestedTon =
          Number(
            request.quantityInKg,
          ) / 1000;

        const availableTon =
          Number(
            facility.availableCapacity ||
              0,
          );

        if (
          requestedTon >
          availableTon
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Insufficient capacity. Only ${availableTon} ton is currently available.`,
          });
        }

        // Reserve capacity
        facility.availableCapacity =
          availableTon -
          requestedTon;

        await facility.save();

        request.status =
          'approved';

        request.adminNote =
          String(
            adminNote || '',
          ).trim();

        request.reviewedBy =
          req.user._id;

        request.reviewedAt =
          new Date();

        await request.save();

        const populatedRequest =
          await StorageRequest.findById(
            request._id,
          )
            .populate(
              'farmer',
              'name email phone role location',
            )
            .populate(
              'storageFacility',
            )
            .populate(
              'reviewedBy',
              'name email role',
            );

        return res.status(200).json({
          success: true,
          message:
            'Storage request approved successfully. Capacity has been reserved.',
          data:
            populatedRequest,
        });
      }

      // ----------------------------------------
      // REJECT
      // ----------------------------------------

      if (status === 'rejected') {
        if (
          request.status !==
          'pending'
        ) {
          return res.status(400).json({
            success: false,
            message:
              'Only pending storage requests can be rejected.',
          });
        }

        request.status =
          'rejected';

        request.adminNote =
          String(
            adminNote || '',
          ).trim();

        request.reviewedBy =
          req.user._id;

        request.reviewedAt =
          new Date();

        await request.save();

        const populatedRequest =
          await StorageRequest.findById(
            request._id,
          )
            .populate(
              'farmer',
              'name email phone role location',
            )
            .populate(
              'storageFacility',
            )
            .populate(
              'reviewedBy',
              'name email role',
            );

        return res.status(200).json({
          success: true,
          message:
            'Storage request rejected successfully.',
          data:
            populatedRequest,
        });
      }

      // ----------------------------------------
      // COMPLETED
      // ----------------------------------------

      if (
        status === 'completed'
      ) {
        if (
          request.status !==
          'approved'
        ) {
          return res.status(400).json({
            success: false,
            message:
              'Only approved storage requests can be marked as completed.',
          });
        }

        request.status =
          'completed';

        request.adminNote =
          String(
            adminNote || '',
          ).trim();

        request.reviewedBy =
          req.user._id;

        request.reviewedAt =
          new Date();

        await request.save();

        const populatedRequest =
          await StorageRequest.findById(
            request._id,
          )
            .populate(
              'farmer',
              'name email phone role location',
            )
            .populate(
              'storageFacility',
            )
            .populate(
              'reviewedBy',
              'name email role',
            );

        return res.status(200).json({
          success: true,
          message:
            'Storage request marked as completed.',
          data:
            populatedRequest,
        });
      }

      return res.status(400).json({
        success: false,
        message:
          'Unable to update storage request.',
      });
    } catch (error) {
      console.error(
        '==========================================',
      );

      console.error(
        'Update Storage Request Status Error:',
        error,
      );

      console.error(
        'ERROR MESSAGE:',
        error.message,
      );

      console.error(
        'ERROR STACK:',
        error.stack,
      );

      console.error(
        '==========================================',
      );

      return res.status(500).json({
        success: false,
        message:
          'Failed to update storage request status.',
        error:
          process.env.NODE_ENV ===
          'development'
            ? error.message
            : undefined,
      });
    }
  };

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createStorageRequest,
  getMyStorageRequests,
  getAllStorageRequests,
  getStorageRequestById,
  cancelStorageRequest,
  updateStorageRequestStatus,
  convertToKg,
  convertFromKg,
  calculateStorageCost,
};