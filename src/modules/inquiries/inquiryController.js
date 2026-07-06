const inquiryService = require('./inquiryService');
const { applySparseFieldset } = require('../../utils/dto');

const createInquiry = async (req, res, next) => {
  try {
    const inquiry = await inquiryService.createInquiry(req.user.id, req.body);
    const optimizedInquiry = applySparseFieldset(inquiry, req.query.fields);
    res.status(201).json({ success: true, data: optimizedInquiry });
  } catch (error) {
    next(error);
  }
};

const getInquiryById = async (req, res, next) => {
  try {
    const inquiry = await inquiryService.getInquiryById(req.params.id, req.user.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }
    const optimizedInquiry = applySparseFieldset(inquiry, req.query.fields);
    res.status(200).json({ success: true, data: optimizedInquiry });
  } catch (error) {
    next(error);
  }
};

const listUserInquiries = async (req, res, next) => {
  try {
    const inquiries = await inquiryService.listUserInquiries(req.user.id);
    const optimizedInquiries = applySparseFieldset(inquiries, req.query.fields);
    res.status(200).json({ success: true, data: optimizedInquiries });
  } catch (error) {
    next(error);
  }
};

const updateInquiryStatus = async (req, res, next) => {
  try {
    const inquiry = await inquiryService.updateInquiryStatus(req.params.id, req.user.id, req.body.status);
    const optimizedInquiry = applySparseFieldset(inquiry, req.query.fields);
    res.status(200).json({ success: true, data: optimizedInquiry });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInquiry,
  getInquiryById,
  listUserInquiries,
  updateInquiryStatus,
};
