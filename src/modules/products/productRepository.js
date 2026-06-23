const { Prisma } = require('@prisma/client');
const { prisma } = require('../../config/db');

const includeProductGraph = {
  seller: {
    select: {
      id: true,
      businessName: true,
      displayName: true,
      contactEmail: true,
      contactPhone: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          companyName: true,
        },
      },
    },
  },
  images: {
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      imageUrl: true,
      storagePath: true,
      sortOrder: true,
      createdAt: true,
    },
  },
};

const normalizePagination = (query = {}) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildOrderBy = (query = {}) => {
  const allowed = new Set(['createdAt', 'productName', 'price', 'location', 'quantity']);
  const sortBy = allowed.has(query.sortBy) ? query.sortBy : 'createdAt';
  const sortOrder = String(query.sortOrder || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
  return [{ [sortBy]: sortOrder }, { id: 'desc' }];
};

const buildWhere = (query = {}) => {
  const where = {};

  if (query.location) {
    where.location = { contains: query.location, mode: 'insensitive' };
  }

  if (query.sellerId) {
    where.sellerId = query.sellerId;
  }

  return where;
};

const createProductWithImages = async (productData, images) => {
  return prisma.$transaction(async (tx) => {
    await tx.product.create({
      data: productData,
    });

    if (images.length > 0) {
      await tx.productImage.createMany({
        data: images.map((image, index) => ({
          productId: productData.id,
          imageUrl: image.imageUrl,
          storagePath: image.storagePath,
          sortOrder: image.sortOrder ?? index,
        })),
      });
    }

    return tx.product.findUnique({
      where: { id: productData.id },
      include: includeProductGraph,
    });
  });
};

const getProductById = async (id) => {
  return prisma.product.findUnique({
    where: { id },
    include: includeProductGraph,
  });
};

const listProducts = async ({ where, orderBy, skip, take }) => {
  return prisma.product.findMany({
    where,
    orderBy,
    skip,
    take,
    include: includeProductGraph,
  });
};

const listSellerProducts = async ({ sellerId, orderBy, skip, take }) => {
  return prisma.product.findMany({
    where: { sellerId },
    orderBy,
    skip,
    take,
    include: includeProductGraph,
  });
};

const countProducts = async (where) => prisma.product.count({ where });

const updateProduct = async (id, patch) => {
  return prisma.product.update({
    where: { id },
    data: {
      ...patch,
      price: patch.price !== undefined ? new Prisma.Decimal(patch.price) : undefined,
    },
    include: includeProductGraph,
  });
};

const deleteProduct = async (id) => prisma.product.delete({ where: { id } });

const searchProducts = async ({ query, where, skip, take }) => {
  const safeQuery = String(query || '').replace(/[^\w\s-]/g, ' ').trim();
  if (!safeQuery) {
    return { items: [], total: 0 };
  }

  const [countRow] = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS total
    FROM products p
    WHERE p.search_vector @@ plainto_tsquery('english', ${safeQuery})
      ${where.location?.contains ? Prisma.sql`AND p.location ILIKE ${`%${where.location.contains}%`}` : Prisma.empty}
      ${where.sellerId ? Prisma.sql`AND p.seller_id = ${where.sellerId}` : Prisma.empty}
  `;

  const rows = await prisma.$queryRaw`
    SELECT p.id,
           ts_rank_cd(p.search_vector, plainto_tsquery('english', ${safeQuery})) AS rank
    FROM products p
    WHERE p.search_vector @@ plainto_tsquery('english', ${safeQuery})
      ${where.location?.contains ? Prisma.sql`AND p.location ILIKE ${`%${where.location.contains}%`}` : Prisma.empty}
      ${where.sellerId ? Prisma.sql`AND p.seller_id = ${where.sellerId}` : Prisma.empty}
    ORDER BY rank DESC, p.created_at DESC
    LIMIT ${take}
    OFFSET ${skip}
  `;

  const ids = rows.map((row) => row.id);
  if (ids.length === 0) {
    return { items: [], total: Number(countRow?.total || 0) };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: includeProductGraph,
  });

  const orderMap = new Map(ids.map((id, index) => [id, index]));
  products.sort((left, right) => orderMap.get(left.id) - orderMap.get(right.id));

  return {
    items: products,
    total: Number(countRow?.total || ids.length),
  };
};

module.exports = {
  normalizePagination,
  buildOrderBy,
  buildWhere,
  createProductWithImages,
  getProductById,
  listProducts,
  listSellerProducts,
  countProducts,
  updateProduct,
  deleteProduct,
  searchProducts,
};