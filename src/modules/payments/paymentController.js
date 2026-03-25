const paymentService = require('./paymentService');
const { sendNotification } = require('../../utils/notifications');

const processPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const updatedOrder = await paymentService.processPaymentIntent(
      orderId,
      req.user.id,
      req.user.role
    );

    // Mock notification
    sendNotification(updatedOrder.sellerId, `Payment received for order ${updatedOrder.id}.`);
    sendNotification(updatedOrder.buyerId, `Payment successful for order ${updatedOrder.id}.`);

    res
      .status(200)
      .json({ success: true, message: 'Payment processed successfully', data: updatedOrder });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes('Forbidden')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    if (error.message.includes('already paid')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = { processPayment };
