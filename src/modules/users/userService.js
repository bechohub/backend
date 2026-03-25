const { prisma } = require('../../config/db');

const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
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

module.exports = { getUserById, getUserByEmail, createUser };
