const sellerService = require('./sellerService');
const productService = require('../products/productService');

const getMySellerProfile = async (req, res, next) => {
  try {
    const seller = await sellerService.getSellerByUserId(req.user.id);

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }

    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    next(error);
  }
};

const getMySellerProducts = async (req, res, next) => {
  try {
    const seller = await sellerService.getSellerByUserId(req.user.id);

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }

    const result = await productService.getSellerProducts(seller.id, req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMySellerProfile,
  getMySellerProducts,
};