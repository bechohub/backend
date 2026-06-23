const sellerRepository = require('./sellerRepository');

const upsertSellerFromUser = async (user, profile = {}) => {
  if (!user?.id) {
    const error = new Error('User is required');
    error.statusCode = 400;
    throw error;
  }

  const displayName = profile.displayName || user.companyName || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
  const businessName = profile.businessName || user.companyName || displayName;

  return sellerRepository.upsertSeller({
    userId: user.id,
    businessName,
    displayName,
    contactEmail: profile.contactEmail || user.email,
    contactPhone: profile.contactPhone || null,
  });
};

const getSellerByUserId = async (userId) => {
  return sellerRepository.findSellerByUserId(userId);
};

module.exports = {
  upsertSellerFromUser,
  getSellerByUserId,
};