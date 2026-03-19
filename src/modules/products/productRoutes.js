const express = require('express');
const { authenticate, authorize } = require('../../middleware/authMiddleware');
const { createProduct, getAllProducts, getProductById } = require('./productController');

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes (Only Sellers can create products)
router.post('/', authenticate, authorize('SELLER', 'ADMIN'), createProduct);

module.exports = router;
