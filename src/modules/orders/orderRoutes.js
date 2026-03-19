const express = require('express');
const { createOrder, getMyOrders } = require('./orderController');
const { authenticate, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticate, authorize('BUYER', 'ADMIN'), createOrder);
router.get('/', authenticate, getMyOrders);

module.exports = router;
