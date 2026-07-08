const { z } = require('zod');

const createInquirySchema = z.object({
  body: z.object({
    sellerId: z.string().uuid({ message: 'Invalid Seller ID' }),
    productId: z.string().uuid({ message: 'Invalid Product ID' }).optional().nullable(),
    message: z.string().min(10, { message: 'Message must be at least 10 characters long' }).max(2000),
  }),
});

const updateInquiryStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid Inquiry ID' }),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'RESPONDED', 'CLOSED'], { message: 'Invalid status' }),
  }),
});

const inquiryIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid Inquiry ID' }),
  }),
});

module.exports = {
  createInquirySchema,
  updateInquiryStatusSchema,
  inquiryIdParamsSchema,
};
