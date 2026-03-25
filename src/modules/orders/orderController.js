const orderService = require('./orderService');
const productService = require('../products/productService'); // Safe boundary!

const createOrder = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Use productService instead of raw prisma call
    const product = await productService.getProductById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.sellerId === req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: 'Forbidden: You cannot buy your own product' });
    }

    const totalPrice = product.price * quantity;

    const order = await orderService.createOrder({
      productId,
      quantity,
      totalPrice,
      buyerId: req.user.id,
      sellerId: product.sellerId,
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const isBuyer = req.user.role === 'BUYER';
    const orders = await orderService.getOrdersByUser(req.user.id, isBuyer);

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders };
