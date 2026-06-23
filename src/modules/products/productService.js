const crypto = require('crypto');
const productRepository = require('./productRepository');
const sellerService = require('../sellers/sellerService');
const { uploadProductImage, removeProductImage } = require('../../utils/storage');

const mapProduct = (product) => {
  if (!product) {
    return product;
  }

  return {
    ...product,
    price: Number(product.price),
  };
};

const ensureSellerProfile = async (user) => {
  const seller = await sellerService.getSellerByUserId(user.id);
  if (seller) {
    return seller;
  }

  return sellerService.upsertSellerFromUser(user, {
    businessName: user.companyName || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
    displayName: user.companyName || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
    contactEmail: user.email,
  });
};

const createProduct = async ({ sellerUser, productData, files }) => {
  const seller = await ensureSellerProfile(sellerUser);
  const productId = crypto.randomUUID();

  if (!files || files.length === 0) {
    const error = new Error('At least one product image is required');
    error.statusCode = 400;
    throw error;
  }

  const uploadedImages = [];
  for (const [index, file] of files.entries()) {
    if (!file.mimetype.startsWith('image/')) {
      const error = new Error('Only image files are allowed');
      error.statusCode = 400;
      throw error;
    }

    uploadedImages.push(await uploadProductImage({
      sellerId: seller.id,
      productId,
      image: { base64: file.buffer.toString('base64') },
      sortOrder: index,
    }));
  }

  const product = await productRepository.createProductWithImages({
    id: productId,
    sellerId: seller.id,
    productName: productData.productName,
    quantity: productData.quantity,
    price: productData.price,
    location: productData.location,
    description: productData.description || null,
  }, uploadedImages);

  return mapProduct(product);
};

const listProducts = async (query) => {
  const pagination = productRepository.normalizePagination(query);
  const where = productRepository.buildWhere(query);
  const orderBy = productRepository.buildOrderBy(query);

  const [total, products] = await Promise.all([
    productRepository.countProducts(where),
    query.q
      ? productRepository.searchProducts({ query: query.q, where, skip: pagination.skip, take: pagination.limit })
      : productRepository.listProducts({ where, orderBy, skip: pagination.skip, take: pagination.limit }),
  ]);

  const resolvedProducts = Array.isArray(products) ? products : products.items;
  const resolvedTotal = Array.isArray(products) ? total : products.total;

  return {
    data: resolvedProducts.map(mapProduct),
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: resolvedTotal,
      totalPages: Math.max(1, Math.ceil(resolvedTotal / pagination.limit)),
    },
  };
};

const getProductById = async (id) => {
  const product = await productRepository.getProductById(id);
  return mapProduct(product);
};

const getSellerProducts = async (sellerId, query) => {
  const pagination = productRepository.normalizePagination(query);
  const orderBy = productRepository.buildOrderBy(query);

  const [total, products] = await Promise.all([
    productRepository.countProducts({ sellerId }),
    productRepository.listSellerProducts({ sellerId, orderBy, skip: pagination.skip, take: pagination.limit }),
  ]);

  return {
    data: products.map(mapProduct),
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
    },
  };
};

const updateProduct = async ({ productId, sellerUserId, patch }) => {
  const seller = await sellerService.getSellerByUserId(sellerUserId);
  if (!seller) {
    const error = new Error('Seller profile not found');
    error.statusCode = 404;
    throw error;
  }

  const product = await productRepository.getProductById(productId);
  if (!product || product.sellerId !== seller.id) {
    const error = new Error('Not authorized to update this product');
    error.statusCode = 403;
    throw error;
  }

  return mapProduct(await productRepository.updateProduct(productId, patch));
};

const deleteProduct = async ({ productId, sellerUserId }) => {
  const seller = await sellerService.getSellerByUserId(sellerUserId);
  if (!seller) {
    const error = new Error('Seller profile not found');
    error.statusCode = 404;
    throw error;
  }

  const product = await productRepository.getProductById(productId);
  if (!product || product.sellerId !== seller.id) {
    const error = new Error('Not authorized to delete this product');
    error.statusCode = 403;
    throw error;
  }

  for (const image of product.images) {
    await removeProductImage(image.storagePath).catch(() => null);
  }

  await productRepository.deleteProduct(productId);
  return true;
};

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  getSellerProducts,
  updateProduct,
  deleteProduct,
};
