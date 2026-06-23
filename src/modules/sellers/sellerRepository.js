const { prisma } = require('../../config/db');

const findSellerByUserId = async (userId) => {
  return prisma.seller.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          companyName: true,
          roles: true,
        },
      },
    },
  });
};

const upsertSeller = async ({ userId, businessName, displayName, contactEmail, contactPhone }) => {
  return prisma.seller.upsert({
    where: { userId },
    update: {
      businessName,
      displayName,
      contactEmail,
      contactPhone,
    },
    create: {
      userId,
      businessName,
      displayName,
      contactEmail,
      contactPhone,
    },
  });
};

module.exports = {
  findSellerByUserId,
  upsertSeller,
};