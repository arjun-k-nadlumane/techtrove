// controllers/orders.js in Customer Service - Update

const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private
 */
exports.createOrder = asyncHandler(async (req, res, next) => {
  // Add user to request body
  req.body.user = req.user.id;
  
  console.log('Creating order:', req.body);
  
  // Validate
  if (!req.body.items || !req.body.items.length) {
    return next(new ErrorResponse('Please provide order items', 400));
  }
  
  if (!req.body.shippingDetails) {
    return next(new ErrorResponse('Please provide shipping details', 400));
  }
  
  // Create order
  const order = await Order.create(req.body);
  
  res.status(201).json({
    success: true,
    data: order
  });
});

/**
 * @desc    Get all orders for user
 * @route   GET /api/orders
 * @access  Private
 */
exports.getOrders = asyncHandler(async (req, res, next) => {
  console.log('Finding orders for user:', req.user.id);
  
  const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
  
  console.log('Found orders:', orders.length);
  
  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id
  });
  
  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: order
  });
});

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  let order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id
  });
  
  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
  }
  
  // Check if order can be cancelled
  if (order.status !== 'pending' && order.status !== 'processing') {
    return next(new ErrorResponse(`Order cannot be cancelled in ${order.status} state`, 400));
  }
  
  // Update order status
  order.status = 'cancelled';
  await order.save();
  
  res.status(200).json({
    success: true,
    data: order
  });
});