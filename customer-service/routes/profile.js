const express = require('express');
const { getProfile, addAddress, updateAddress, deleteAddress } = require('../controllers/profile');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/', getProfile);
router.post('/address', addAddress);
router.put('/address/:id', updateAddress);
router.delete('/address/:id', deleteAddress);

module.exports = router;