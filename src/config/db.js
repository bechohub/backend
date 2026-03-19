const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database successfully.');
  } catch (error) {
    logger.error('Database connection failed: ', error);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };
