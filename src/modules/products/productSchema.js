const { z } = require('zod');

const createProductSchema = z.object({
  productName: z.string().trim().min(3, 'Product name must be at least 3 characters'),
  quantity: z.coerce.number().int().nonnegative('Quantity must be zero or greater'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  location: z.string().trim().min(2, 'Location must be at least 2 characters'),
  description: z.string().trim().max(2000).optional(),
});

const updateProductSchema = z.object({
  productName: z.string().trim().min(3).optional(),
  quantity: z.coerce.number().int().nonnegative().optional(),
  price: z.coerce.number().positive().optional(),
  location: z.string().trim().min(2).optional(),
  description: z.string().trim().max(2000).optional(),
});

const productListingQuerySchema = z.object({
  q: z.string().trim().optional(),
  location: z.string().trim().optional(),
  sellerId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'productName', 'price', 'location', 'quantity']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const productIdParamsSchema = z.object({
  id: z.string().uuid('Invalid product ID'),
});

const sellerProductsParamsSchema = z.object({
  sellerId: z.string().uuid('Invalid seller ID'),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  productListingQuerySchema,
  productIdParamsSchema,
  sellerProductsParamsSchema,
};
