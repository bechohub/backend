const inquiryRepository = require('./inquiryRepository');
const sellerService = require('../sellers/sellerService');

const createInquiry = async (buyerId, data) => {
  if (!data.sellerId) {
    const error = new Error('sellerId is required');
    error.statusCode = 400;
    throw error;
  }
  if (!data.message) {
    const error = new Error('message is required');
    error.statusCode = 400;
    throw error;
  }

  return inquiryRepository.createInquiry({
    buyerId,
    sellerId: data.sellerId,
    productId: data.productId || null,
    message: data.message,
    status: 'PENDING'
  });
};

const getInquiryById = async (id, userId) => {
  const inquiry = await inquiryRepository.getInquiryById(id);
  if (!inquiry) return null;

  // Authorization check
  const sellerProfile = await sellerService.getSellerByUserId(userId);
  const isBuyer = inquiry.buyerId === userId;
  const isSeller = sellerProfile && inquiry.sellerId === sellerProfile.id;

  if (!isBuyer && !isSeller) {
    const error = new Error('Not authorized to view this inquiry');
    error.statusCode = 403;
    throw error;
  }

  return inquiry;
};

const listUserInquiries = async (userId) => {
  // A user can be a buyer, or they might have a seller profile.
  const sellerProfile = await sellerService.getSellerByUserId(userId);

  const where = {
    OR: [
      { buyerId: userId }
    ]
  };

  if (sellerProfile) {
    where.OR.push({ sellerId: sellerProfile.id });
  }

  return inquiryRepository.listInquiries(where);
};

const updateInquiryStatus = async (id, userId, status) => {
  const inquiry = await getInquiryById(id, userId);
  if (!inquiry) {
    const error = new Error('Inquiry not found');
    error.statusCode = 404;
    throw error;
  }

  // Usually the seller updates the status to RESPONDED or CLOSED
  // For simplicity, we just check if the user is authorized (done in getInquiryById)
  return inquiryRepository.updateInquiry(id, { status });
};

module.exports = {
  createInquiry,
  getInquiryById,
  listUserInquiries,
  updateInquiryStatus,
};
