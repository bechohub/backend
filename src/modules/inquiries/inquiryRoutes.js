const express = require('express');
const inquiryController = require('./inquiryController');
const { authenticate } = require('../../middleware/authMiddleware');
const validate = require('../../middleware/validate');
const {
  createInquirySchema,
  updateInquiryStatusSchema,
  inquiryIdParamsSchema,
} = require('./inquirySchema');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createInquirySchema), inquiryController.createInquiry);
router.get('/', inquiryController.listUserInquiries);
router.get('/:id', validate(inquiryIdParamsSchema), inquiryController.getInquiryById);
router.patch('/:id/status', validate(updateInquiryStatusSchema), inquiryController.updateInquiryStatus);

module.exports = router;
