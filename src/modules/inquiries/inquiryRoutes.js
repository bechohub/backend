const express = require('express');
const inquiryController = require('./inquiryController');
const { requireAuth } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.post('/', inquiryController.createInquiry);
router.get('/', inquiryController.listUserInquiries);
router.get('/:id', inquiryController.getInquiryById);
router.patch('/:id/status', inquiryController.updateInquiryStatus);

module.exports = router;
