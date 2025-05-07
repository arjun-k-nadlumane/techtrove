const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * @desc    Get user profile
 * @route   GET /api/profile
 * @access  Private
 */
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Add user address
 * @route   POST /api/profile/address
 * @access  Private
 */
exports.addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const addresses = await user.addAddress(req.body);

  res.status(200).json({
    success: true,
    data: addresses
  });
});

/**
 * @desc    Update user address
 * @route   PUT /api/profile/address/:id
 * @access  Private
 */
exports.updateAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  try {
    const addresses = await user.updateAddress(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: addresses
    });
  } catch (err) {
    return next(new ErrorResponse(err.message, 404));
  }
});

/**
 * @desc    Delete user address
 * @route   DELETE /api/profile/address/:id
 * @access  Private
 */
exports.deleteAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  try {
    const addresses = await user.removeAddress(req.params.id);

    res.status(200).json({
      success: true,
      data: addresses
    });
  } catch (err) {
    return next(new ErrorResponse(err.message, 404));
  }
});