const { prisma } = require('../../config/db');

const includeInquiryGraph = {
  buyer: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      companyName: true,
    }
  },
  seller: {
    select: {
      id: true,
      businessName: true,
      contactEmail: true,
    }
  },
  product: {
    select: {
      id: true,
      productName: true,
      price: true,
    }
  }
};

const createInquiry = async (data) => {
  return prisma.inquiry.create({
    data,
    include: includeInquiryGraph,
  });
};

const getInquiryById = async (id) => {
  return prisma.inquiry.findUnique({
    where: { id },
    include: includeInquiryGraph,
  });
};

const listInquiries = async (where) => {
  return prisma.inquiry.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: includeInquiryGraph,
  });
};

const updateInquiry = async (id, data) => {
  return prisma.inquiry.update({
    where: { id },
    data,
    include: includeInquiryGraph,
  });
};

module.exports = {
  createInquiry,
  getInquiryById,
  listInquiries,
  updateInquiry,
};
