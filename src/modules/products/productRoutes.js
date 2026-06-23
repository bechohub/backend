const express = require('express');
const multer = require('multer');
const productController = require('./productController');
const { authenticate, authorize } = require('../../middleware/authMiddleware');
const validate = require('../../middleware/validate');
const {
  createProductSchema,
  updateProductSchema,
  productListingQuerySchema,
  productIdParamsSchema,
  sellerProductsParamsSchema,
} = require('./productSchema');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 6 * 1024 * 1024,
    files: 10,
  },
});

router.get('/', validate(productListingQuerySchema, 'query'), productController.listProducts);
router.get('/seller/:sellerId', validate(sellerProductsParamsSchema, 'params'), validate(productListingQuerySchema, 'query'), productController.getSellerProducts);
router.get('/:id', validate(productIdParamsSchema, 'params'), productController.getProductById);

router.post(
  '/',
  authenticate,
  authorize('SELLER'),
  upload.array('images', 10),
  validate(createProductSchema),
  productController.createProduct
);

router.patch(
  '/:id',
  authenticate,
  authorize('SELLER'),
  upload.array('images', 10),
  validate(productIdParamsSchema, 'params'),
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('SELLER'),
  validate(productIdParamsSchema, 'params'),
  productController.deleteProduct
);

module.exports = router;
