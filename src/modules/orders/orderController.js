const { prisma } = require('../../config/db');
const { sendNotification } = require('../../utils/notifications');

// Create Order (Buyer purchases a product)
const createOrder = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Prevent seller from buying their own product (optional but good practice)
    if (product.sellerId === req.user.id) {
       return res.status(403).json({ success: false, message: 'Forbidden: You cannot buy your own product' });
    }

    const totalPrice = product.price * quantity;

    const order = await prisma.order.create({
      data: {
        productId,
        quantity,
        totalPrice,
        buyerId: req.user.id,
        sellerId: product.sellerId,
      },
    });

    // Send mock notification to the seller
    // sendNotification(product.sellerId, `New order received for product "${product.title}".`);

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// Get My Orders
const getMyOrders = async (req, res, next) => {
  try {
    const isBuyer = req.user.role === 'BUYER';
    const whereClause = isBuyer ? { buyerId: req.user.id } : { sellerId: req.user.id };

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        product: { select: { title: true, price: true } },
        buyer: { select: { name: true, email: true } },
        seller: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders };
