const { prisma } = require('../../config/db');

const getUserById = async (id) => {
  return prisma.profile.findUnique({
    where: { id },
  });
};

const getUserByEmail = async (email) => {
  // Using findFirst because email is currently not marked @unique natively in Supabase
  return prisma.profile.findFirst({
    where: { email },
  });
};

const createUser = async (data) => {
  return prisma.profile.create({
    data,
  });
};

module.exports = { getUserById, getUserByEmail, createUser };
