const productService = require('./productService');

const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, featured } = req.body;
    const sellerId = req.user.id;

    const product = await productService.createProduct(
      {
        title,
        description,
        price: parseFloat(price),
        featured: featured !== undefined ? (featured === 'true' || featured === true) : undefined
      },
      sellerId
    );

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
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;
    const updateData = req.body;

    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.featured !== undefined) {
      updateData.featured = updateData.featured === 'true' || updateData.featured === true;
    }

    const updatedProduct = await productService.updateProduct(
      id,
      sellerId,
      updateData
    );

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    await productService.deleteProduct(id, sellerId);
    res
      .status(200)
      .json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await productService.getFeaturedProducts();
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res
        .status(400)
        .json({ success: false, message: 'Search query parameter "q" is required.' });
    }

    const products = await productService.searchProducts(q);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  searchProducts,
};
