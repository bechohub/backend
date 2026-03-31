const { z } = require('zod');

const createProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be a positive number'),
  sellerId: z.string().uuid('Invalid Seller ID').optional(), // can be added via authentication middleware
});

const updateProductSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  price: z.number().positive().optional()
});

module.exports = {
  createProductSchema,
  updateProductSchema
};
