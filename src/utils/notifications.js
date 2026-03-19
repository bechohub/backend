const logger = require('./logger');

const sendNotification = (userId, message) => {
  // In a real app, this would use SMS/WhatsApp API
  logger.info(`Notification to User ${userId}: ${message}`);
};

module.exports = { sendNotification };
