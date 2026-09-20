const StorageFacility = require('../models/StorageFacility');

/*
 * ==========================================
 * Get All Storage Facilities
 * ==========================================
 */
const getStorageFacilities = async (req, res) => {
  try {
    const {
      district,
      type,
      search,
      crop,
    } = req.query;

    const filter = {
      isActive: true,
    };

    /*
     * District filter
     */
    if (district) {
      filter['location.district'] = {
        $regex: district,
        $options: 'i',
      };
    }

    /*
     * Storage type filter
     */
    if (type) {
      if (!['cold_storage', 'warehouse'].includes(type)) {
        return res.status(400).json({
          success: false,
          message:
            'Type must be cold_storage or warehouse.',
        });
      }

      filter.type = type;
    }

    /*
     * Search by facility name,
     * district or village
     */
    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          'location.district': {
            $regex: search,
            $options: 'i',
          },
        },
        {
          'location.village': {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    /*
     * Search facilities suitable
     * for a particular crop.
     */
    if (crop) {
      filter.suitableCrops = {
        $regex: crop,
        $options: 'i',
      };
    }

    const facilities =
      await StorageFacility.find(filter)
        .sort({
          isVerified: -1,
          name: 1,
        });

    const coldStorageCount =
      facilities.filter(
        (facility) =>
          facility.type === 'cold_storage',
      ).length;

    const warehouseCount =
      facilities.filter(
        (facility) =>
          facility.type === 'warehouse',
      ).length;

    res.status(200).json({
      success: true,

      count: facilities.length,

      summary: {
        coldStorage: coldStorageCount,
        warehouses: warehouseCount,
        total: facilities.length,
      },

      data: facilities,
    });
  } catch (error) {
    console.error(
      'Get storage facilities error:',
      error,
    );

    res.status(500).json({
      success: false,
      message:
        'Failed to fetch storage facilities.',
    });
  }
};


/*
 * ==========================================
 * Get Single Storage Facility
 * ==========================================
 */
const getStorageFacilityById = async (
  req,
  res,
) => {
  try {
    const facility =
      await StorageFacility.findById(
        req.params.id,
      );

    if (!facility || !facility.isActive) {
      return res.status(404).json({
        success: false,
        message:
          'Storage facility not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: facility,
    });
  } catch (error) {
    console.error(
      'Get storage facility error:',
      error,
    );

    res.status(500).json({
      success: false,
      message:
        'Failed to fetch storage facility.',
    });
  }
};


/*
 * ==========================================
 * Create Storage Facility
 * ==========================================
 */
const createStorageFacility = async (
  req,
  res,
) => {
  try {
    const {
      name,
      type,
      description,
      location,
      capacity,
      capacityUnit,
      availableCapacity,
      suitableCrops,
      temperatureRange,
      storageCharges,
      contact,
      operatingHours,
      facilities,
      isVerified,
      source,
    } = req.body;

    /*
     * Required fields
     */
    if (
      !name ||
      !type ||
      !location?.district ||
      capacity === undefined ||
      availableCapacity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Name, type, district, capacity and available capacity are required.',
      });
    }

    /*
     * Validate type
     */
    if (
      ![
        'cold_storage',
        'warehouse',
      ].includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Type must be cold_storage or warehouse.',
      });
    }

    const parsedCapacity =
      Number(capacity);

    const parsedAvailableCapacity =
      Number(availableCapacity);

    if (
      !Number.isFinite(
        parsedCapacity,
      ) ||
      parsedCapacity < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Capacity must be a valid non-negative number.',
      });
    }

    if (
      !Number.isFinite(
        parsedAvailableCapacity,
      ) ||
      parsedAvailableCapacity < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Available capacity must be a valid non-negative number.',
      });
    }

    if (
      parsedAvailableCapacity >
      parsedCapacity
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Available capacity cannot exceed total capacity.',
      });
    }

    /*
     * Create facility
     */
    const facility =
      await StorageFacility.create({
        name: name.trim(),

        type,

        description:
          description
            ? description.trim()
            : '',

        location: {
          address:
            location?.address || '',

          village:
            location?.village || '',

          district:
            location.district.trim(),

          state:
            location?.state ||
            'Maharashtra',

          pincode:
            location?.pincode || '',

          latitude:
            location?.latitude ?? null,

          longitude:
            location?.longitude ?? null,
        },

        capacity:
          parsedCapacity,

        capacityUnit:
          capacityUnit || 'ton',

        availableCapacity:
          parsedAvailableCapacity,

        suitableCrops:
          Array.isArray(
            suitableCrops,
          )
            ? suitableCrops
            : [],

        temperatureRange:
          temperatureRange || '',

        storageCharges:
          storageCharges || {
            amount: 0,
            unit: 'per ton/month',
          },

        contact:
          contact || {},

        operatingHours:
          operatingHours ||
          '9:00 AM - 6:00 PM',

        facilities:
          Array.isArray(facilities)
            ? facilities
            : [],

        /*
         * Only admin should be able
         * to mark a facility verified.
         */
        isVerified:
          req.user.role === 'admin'
            ? Boolean(isVerified)
            : false,

        source:
          source ||
          'KrishiBandhu',
      });

    res.status(201).json({
      success: true,

      message:
        'Storage facility created successfully.',

      data: facility,
    });
  } catch (error) {
    console.error(
      'Create storage facility error:',
      error,
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        'Failed to create storage facility.',
    });
  }
};


/*
 * ==========================================
 * Update Storage Facility
 * ==========================================
 */
const updateStorageFacility = async (
  req,
  res,
) => {
  try {
    const facility =
      await StorageFacility.findById(
        req.params.id,
      );

    if (!facility) {
      return res.status(404).json({
        success: false,
        message:
          'Storage facility not found.',
      });
    }

    const {
      name,
      type,
      description,
      location,
      capacity,
      capacityUnit,
      availableCapacity,
      suitableCrops,
      temperatureRange,
      storageCharges,
      contact,
      operatingHours,
      facilities,
      isVerified,
      isActive,
      source,
    } = req.body;

    if (name !== undefined) {
      facility.name =
        name.trim();
    }

    if (type !== undefined) {
      if (
        ![
          'cold_storage',
          'warehouse',
        ].includes(type)
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Type must be cold_storage or warehouse.',
        });
      }

      facility.type = type;
    }

    if (description !== undefined) {
      facility.description =
        description
          ? description.trim()
          : '';
    }

    if (location !== undefined) {
      facility.location = {
        ...facility.location.toObject(),

        ...location,
      };
    }

    if (capacity !== undefined) {
      const parsedCapacity =
        Number(capacity);

      if (
        !Number.isFinite(
          parsedCapacity,
        ) ||
        parsedCapacity < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Capacity must be a valid non-negative number.',
        });
      }

      facility.capacity =
        parsedCapacity;
    }

    if (
      availableCapacity !==
      undefined
    ) {
      const parsedAvailableCapacity =
        Number(
          availableCapacity,
        );

      if (
        !Number.isFinite(
          parsedAvailableCapacity,
        ) ||
        parsedAvailableCapacity < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Available capacity must be a valid non-negative number.',
        });
      }

      facility.availableCapacity =
        parsedAvailableCapacity;
    }

    /*
     * Capacity consistency check
     */
    if (
      facility.availableCapacity >
      facility.capacity
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Available capacity cannot exceed total capacity.',
      });
    }

    if (
      capacityUnit !==
      undefined
    ) {
      facility.capacityUnit =
        capacityUnit;
    }

    if (
      suitableCrops !==
      undefined
    ) {
      facility.suitableCrops =
        Array.isArray(
          suitableCrops,
        )
          ? suitableCrops
          : [];
    }

    if (
      temperatureRange !==
      undefined
    ) {
      facility.temperatureRange =
        temperatureRange;
    }

    if (
      storageCharges !==
      undefined
    ) {
      facility.storageCharges =
        storageCharges;
    }

    if (
      contact !== undefined
    ) {
      facility.contact =
        contact;
    }

    if (
      operatingHours !==
      undefined
    ) {
      facility.operatingHours =
        operatingHours;
    }

    if (
      facilities !== undefined
    ) {
      facility.facilities =
        Array.isArray(
          facilities,
        )
          ? facilities
          : [];
    }

    /*
     * Verification and activation
     * are admin-controlled.
     */
    if (
      req.user.role === 'admin'
    ) {
      if (
        isVerified !== undefined
      ) {
        facility.isVerified =
          Boolean(isVerified);
      }

      if (
        isActive !== undefined
      ) {
        facility.isActive =
          Boolean(isActive);
      }
    }

    if (source !== undefined) {
      facility.source =
        source;
    }

    await facility.save();

    res.status(200).json({
      success: true,

      message:
        'Storage facility updated successfully.',

      data: facility,
    });
  } catch (error) {
    console.error(
      'Update storage facility error:',
      error,
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        'Failed to update storage facility.',
    });
  }
};


/*
 * ==========================================
 * Delete Storage Facility
 * ==========================================
 */
const deleteStorageFacility = async (
  req,
  res,
) => {
  try {
    const facility =
      await StorageFacility.findById(
        req.params.id,
      );

    if (!facility) {
      return res.status(404).json({
        success: false,
        message:
          'Storage facility not found.',
      });
    }

    /*
     * Soft delete instead of
     * permanently removing data.
     */
    facility.isActive = false;

    await facility.save();

    res.status(200).json({
      success: true,

      message:
        'Storage facility removed successfully.',
    });
  } catch (error) {
    console.error(
      'Delete storage facility error:',
      error,
    );

    res.status(500).json({
      success: false,
      message:
        'Failed to remove storage facility.',
    });
  }
};


module.exports = {
  getStorageFacilities,
  getStorageFacilityById,
  createStorageFacility,
  updateStorageFacility,
  deleteStorageFacility,
};