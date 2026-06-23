const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || err.status || (err.name === 'ZodError' ? 400 : 500);
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req?.method,
    url: req?.originalUrl,
    status,
  });
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

module.exports = { errorHandler };
