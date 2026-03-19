const app = require('./app');
const env = require('./src/config/env');
const { connectDB } = require('./src/config/db');
const logger = require('./src/utils/logger');

const startServer = async () => {
  await connectDB();
  
  app.listen(env.PORT, () => {
    logger.info(`Server is running on port ${env.PORT}`);
  });
};

startServer();
