const User = require('../models/User');

/*
|--------------------------------------------------------------------------
| Get All Users
|--------------------------------------------------------------------------
*/

const getAllUsers = async (req, res) => {
  try {
    const {
      role,
      status,
      search,
    } = req.query;

    const filter = {};

    // Filter by role
    if (
      role &&
      ['farmer', 'trader', 'admin'].includes(role)
    ) {
      filter.role = role;
    }

    // Filter by status
    if (status === 'active') {
      filter.isActive = true;
    }

    if (status === 'inactive') {
      filter.isActive = false;
    }

    // Search
    if (search && search.trim()) {
      const searchValue = search.trim();

      filter.$or = [
        {
          name: {
            $regex: searchValue,
            $options: 'i',
          },
        },
        {
          email: {
            $regex: searchValue,
            $options: 'i',
          },
        },
        {
          phone: {
            $regex: searchValue,
            $options: 'i',
          },
        },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(
      'Get All Users Error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch users.',
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get User By ID
|--------------------------------------------------------------------------
*/

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id,
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      'Get User By ID Error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch user.',
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update User Status
|--------------------------------------------------------------------------
*/

const updateUserStatus = async (
  req,
  res,
) => {
  try {
    const {
      isActive,
    } = req.body;

    if (
      typeof isActive !== 'boolean'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'isActive must be true or false.',
      });
    }

    const user = await User.findById(
      req.params.id,
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Prevent admin from deactivating themselves
    if (
      user._id.toString() ===
      req.user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          'You cannot deactivate your own admin account.',
      });
    }

    user.isActive = isActive;

    await user.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? 'User account activated.'
        : 'User account deactivated.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        location: user.location,
      },
    });
  } catch (error) {
    console.error(
      'Update User Status Error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        'Unable to update user status.',
    });
  }
};

/*
|--------------------------------------------------------------------------
| Verify / Unverify User
|--------------------------------------------------------------------------
*/

const updateUserVerification = async (
  req,
  res,
) => {
  try {
    const {
      isVerified,
    } = req.body;

    if (
      typeof isVerified !== 'boolean'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'isVerified must be true or false.',
      });
    }

    const user = await User.findById(
      req.params.id,
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    user.isVerified = isVerified;

    await user.save();

    return res.status(200).json({
      success: true,
      message: isVerified
        ? 'User verified successfully.'
        : 'User verification removed.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        location: user.location,
      },
    });
  } catch (error) {
    console.error(
      'Update User Verification Error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        'Unable to update user verification.',
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update User Role
|--------------------------------------------------------------------------
*/

const updateUserRole = async (
  req,
  res,
) => {
  try {
    const {
      role,
    } = req.body;

    // Only Farmer and Trader roles
    // can be assigned through this API.
    if (
      !['farmer', 'trader'].includes(
        role,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Role must be either farmer or trader.',
      });
    }

    const user = await User.findById(
      req.params.id,
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Never allow an admin account
    // to be converted into Farmer/Trader.
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message:
          'Administrator roles cannot be changed here.',
      });
    }

    // No need to update if already the same.
    if (user.role === role) {
      return res.status(200).json({
        success: true,
        message:
          'User already has this role.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          isVerified: user.isVerified,
          location: user.location,
        },
      });
    }

    user.role = role;

    // When converting a user to Trader,
    // verification starts as false.
    if (role === 'trader') {
      user.isVerified = false;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        role === 'trader'
          ? 'User changed to Trader. Trader verification is required.'
          : 'User changed to Farmer.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        location: user.location,
      },
    });
  } catch (error) {
    console.error(
      'Update User Role Error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        'Unable to update user role.',
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserVerification,
  updateUserRole,
};