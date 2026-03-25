// In a real app, this service talks to Stripe/Razorpay SDKs
// It does not need prisma DB if another module owns the state!
const orderService = require('../orders/orderService');

const processPaymentIntent = async (orderId, userId, userRole) => {
  const order = await orderService.getOrderById(orderId);
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  if (order.buyerId !== userId && userRole !== 'ADMIN') {
    throw new Error('Forbidden: You do not own this order');
  }

  if (order.paymentStatus === 'PAID') {
    throw new Error('Order is already paid');
  }

  // Orchestrate external payment logic here...
  
  // Call internal sibling service to persist data!
  const updatedOrder = await orderService.updateOrderPaymentStatus(orderId, 'COMPLETED', 'PAID');
  
  return updatedOrder;
};

module.exports = { processPaymentIntent };
