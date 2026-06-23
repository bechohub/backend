const productService = require('./productService');

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct({
      sellerUser: req.user,
      productData: req.body,
      files: req.files || [],
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const listProducts = async (req, res, next) => {
  try {
    const result = await productService.listProducts(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const getSellerProducts = async (req, res, next) => {
  try {
    const result = await productService.getSellerProducts(req.params.sellerId, req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct({
      productId: req.params.id,
      sellerUserId: req.user.id,
      patch: req.body,
    });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct({
      productId: req.params.id,
      sellerUserId: req.user.id,
    });

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  getSellerProducts,
  updateProduct,
  deleteProduct,
};
