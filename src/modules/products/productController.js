const { prisma } = require('../../config/db');

// Create Product (Seller Only)
const createProduct = async (req, res, next) => {
  try {
    const { title, description, price } = req.body;

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price,
        sellerId: req.user.id,
      },
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// Get all Products
const getAllProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        seller: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

// Get Product by ID
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: { select: { name: true, email: true } },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProduct, getAllProducts, getProductById };
