const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * @desc    Get wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
exports.getWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('wishlist');

  res.status(200).json({
    success: true,
    data: user.wishlist
  });
});

/**
 * @desc    Add item to wishlist
 * @route   POST /api/wishlist/:productId
 * @access  Private
 */
exports.addToWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const wishlist = await user.addToWishlist(req.params.productId);

  res.status(200).json({
    success: true,
    data: wishlist
  });
});

/**
 * @desc    Remove item from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
exports.removeFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const wishlist = await user.removeFromWishlist(req.params.productId);

  res.status(200).json({
    success: true,
    data: wishlist
  });
});