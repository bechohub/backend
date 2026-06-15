const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['BUYER', 'SELLER', 'ADMIN']).optional(),
  companyName: z.string().optional(),
  category: z.string().optional(),
  businessScale: z.string().optional(),
  gstNumber: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['BUYER', 'SELLER', 'ADMIN']).optional()
});

module.exports = {
  registerSchema,
  loginSchema
};
