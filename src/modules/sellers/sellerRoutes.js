const express = require('express');
const { authenticate, authorize } = require('../../middleware/authMiddleware');
const sellerController = require('./sellerController');

const router = express.Router();

router.get('/me', authenticate, authorize('SELLER'), sellerController.getMySellerProfile);
router.get('/me/products', authenticate, authorize('SELLER'), sellerController.getMySellerProducts);

module.exports = router;