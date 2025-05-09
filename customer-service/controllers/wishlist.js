const User = require('../models/User');
const Product = require('../models/Product');
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
  const userId = req.user.id;
  const user = await User.findById(userId);
  const productId = req.params.productId;
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  if (user.wishlist.some(item => item.toString() === productId)) {
    return res.status(400).json({ success: false, error: 'Product already in wishlist' });
  }
  user.wishlist.push(productId);
  await user.save();
  res.status(200).json({ success: true, message: 'Product added to wishlist' });
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