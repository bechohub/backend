const { prisma } = require('../../config/db');

const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      companyName: true,
      email: true,
      roles: true,
      gstNumber: true,
      createdAt: true,
    },
  });
};

const getUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const createUser = async (data) => {
  return prisma.user.create({
    data,
  });
};

const updateUser = async (id, data) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

module.exports = { getUserById, getUserByEmail, createUser, updateUser };
