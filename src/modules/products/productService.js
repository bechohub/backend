const { prisma } = require('../../config/db');

/**
 * Create a new product
 * @param {Object} productData - { title, description, price }
 * @param {string} sellerId - UUID of the seller (from Auth token)
 */
const createProduct = async (productData, sellerId) => {
  return await prisma.product.create({
    data: {
      ...productData,
      sellerId,
    },
  });
};

/**
 * Get all products
 * @param {Object} filters - Optional searching and filtering logic
 */
const getAllProducts = async (filters = {}) => {
  return await prisma.product.findMany({
    include: {
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          companyName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Get product by ID
 * @param {string} id - Product UUID
 */
const getProductById = async (id) => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          companyName: true,
        },
      },
    },
  });
};

/**
 * Update a product (only by owner)
 * @param {string} id - Product UUID
 * @param {string} sellerId - UUID of the seller to verify ownership
 * @param {Object} updateData - Modified product fields
 */
const updateProduct = async (id, sellerId, updateData) => {
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product || product.sellerId !== sellerId) {
    throw new Error('Not authorized to update this product.');
  }

  return await prisma.product.update({
    where: { id },
    data: updateData,
  });
};

/**
 * Delete a product (only by owner)
 * @param {string} id - Product UUID
 * @param {string} sellerId - UUID of the seller to verify ownership
 */
const deleteProduct = async (id, sellerId) => {
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product || product.sellerId !== sellerId) {
    throw new Error('Not authorized to delete this product.');
  }

  return await prisma.product.delete({
    where: { id },
  });
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
