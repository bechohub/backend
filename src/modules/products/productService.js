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

/**
 * Get featured products
 * Fallbacks to top 10 most recent products if no products are marked as featured.
 */
const getFeaturedProducts = async () => {
  let products = await prisma.product.findMany({
    where: { featured: true },
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

  if (products.length === 0) {
    // Fallback: load 10 most recent products
    products = await prisma.product.findMany({
      take: 10,
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
  }

  return products;
};

/**
 * Search products with PostgreSQL full-text search and ranking.
 * Supports prefix matching for autocomplete / instant typing search.
 * @param {string} q - The search query term.
 */
const searchProducts = async (q) => {
  if (!q || typeof q !== 'string') {
    return [];
  }

  const cleanQuery = q.replace(/[^\w\s]/g, ' ').trim();
  if (!cleanQuery) {
    return [];
  }

  let rankedProducts = [];
  try {
    const words = cleanQuery.split(/\s+/).filter(Boolean);
    const tsQuery = words.map(w => `${w}:*`).join(' & ');

    rankedProducts = await prisma.$queryRaw`
      SELECT id,
             ts_rank_cd(
               to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')),
               to_tsquery('english', ${tsQuery})
             ) AS rank
      FROM "Product"
      WHERE to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')) @@ to_tsquery('english', ${tsQuery})
      ORDER BY rank DESC;
    `;
  } catch (error) {
    const logger = require('../../utils/logger');
    logger.error('FTS search failed, falling back to ILIKE search:', error);

    const fallbackProducts = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true },
    });

    rankedProducts = fallbackProducts.map((p) => ({ id: p.id, rank: 1.0 }));
  }

  if (rankedProducts.length === 0) {
    return [];
  }

  const ids = rankedProducts.map((p) => p.id);

  // Fetch full products including seller details
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
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

  // Re-sort the products to match the PostgreSQL ts_rank order
  const idToIndex = new Map(ids.map((id, index) => [id, index]));
  products.sort((a, b) => idToIndex.get(a.id) - idToIndex.get(b.id));

  return products;
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
