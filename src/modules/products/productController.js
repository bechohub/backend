const productService = require('./productService');

const createProduct = async (req, res, next) => {
  try {
    const { title, description, price } = req.body;

    const product = await productService.createProduct({
      title,
      description,
      price,
      sellerId: req.user.id,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProduct, getAllProducts, getProductById };
