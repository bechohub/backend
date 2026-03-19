const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes');
const { errorHandler } = require('./src/middleware/errorHandler');
const logger = require('./src/utils/logger');

const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// APIs
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
