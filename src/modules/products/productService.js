const { prisma } = require('../../config/db');

const createProduct = async (data) => {
  return prisma.product.create({
    data,
  });
};

const getAllProducts = async () => {
  return prisma.product.findMany({
    include: {
      seller: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getProductById = async (id) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      seller: { select: { name: true, email: true } },
    },
  });
};

module.exports = { createProduct, getAllProducts, getProductById };
