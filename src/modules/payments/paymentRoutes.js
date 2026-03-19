const express = require('express');
const { processPayment } = require('./paymentController');
const { authenticate, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticate, authorize('BUYER', 'ADMIN'), processPayment);

module.exports = router;
