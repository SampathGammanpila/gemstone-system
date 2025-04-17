import { createServer } from './server';
import { config } from './config/environment';
import { logger } from './utils/logger';

// Create and start server
const startServer = async () => {
  try {
    const app = await createServer();
    
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`Health check available at http://localhost:${config.port}/health`);
      
      if (config.nodeEnv === 'development') {
        logger.info(`API available at http://localhost:${config.port}/api`);
        logger.info(`Admin panel available at http://localhost:${config.port}/admin`);
      }
    });
    
    // Handle graceful shutdown
    const shutdown = () => {
      logger.info('Shutting down server...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forcing server shutdown after timeout');
        process.exit(1);
      }, 10000);
    };
    
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();