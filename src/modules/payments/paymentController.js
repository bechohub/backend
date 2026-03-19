const { prisma } = require('../../config/db');
const { sendNotification } = require('../../utils/notifications');

const processPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.buyerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this order' });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({ success: false, message: 'Order is already paid' });
    }

    // Mock payment processing...
    // In real app, you would integrate Razorpay, Stripe, etc.
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'PAID', status: 'COMPLETED' }, // Also assume COMPLETED for this simple V1 logic
    });

    sendNotification(order.sellerId, `Payment received for order ${updatedOrder.id}.`);
    sendNotification(order.buyerId, `Payment successful for order ${updatedOrder.id}.`);

    res.status(200).json({ success: true, message: 'Payment processed successfully', data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

module.exports = { processPayment };
