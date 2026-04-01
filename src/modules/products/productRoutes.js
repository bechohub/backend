const express = require('express');
const productController = require('./productController');
const { authenticate, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

// Public Routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected Routes (Sellers only)
router.post(
  '/',
  authenticate,
  authorize('SELLER'),
  productController.createProduct
);

router.patch(
  '/:id',
  authenticate,
  authorize('SELLER'),
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('SELLER'),
  productController.deleteProduct
);

module.exports = router;
