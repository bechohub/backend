const { prisma } = require('../../config/db');

const createOrder = async (data) => {
  return prisma.order.create({
    data,
  });
};

const updateOrderPaymentStatus = async (orderId, status, paymentStatus) => {
  return prisma.order.update({
    where: { id: orderId },
    data: { status, paymentStatus },
  });
};

const getOrderById = async (id) => {
  return prisma.order.findUnique({ where: { id } });
};

const getOrdersByUser = async (userId, isBuyer) => {
  const whereClause = isBuyer ? { buyerId: userId } : { sellerId: userId };
  return prisma.order.findMany({
    where: whereClause,
    include: {
      product: { select: { title: true, price: true } },
      buyer: { select: { firstName: true, companyName: true, email: true } },
      seller: { select: { firstName: true, companyName: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

module.exports = { createOrder, getOrderById, updateOrderPaymentStatus, getOrdersByUser };
