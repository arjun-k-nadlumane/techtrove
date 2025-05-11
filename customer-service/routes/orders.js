const express = require('express');
const { 
  createOrder, 
  getOrders, 
  getOrder, 
  cancelOrder, 
  updatePaymentStatus
} = require('../controllers/orders');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrder);

router.patch('/:id', protect, updatePaymentStatus)

router.route('/:id/cancel')
  .put(cancelOrder);

module.exports = router;