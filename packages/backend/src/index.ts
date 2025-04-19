import { createServer } from './server';
import { sequelize } from './db';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get port from environment or default to 3000
const PORT = process.env.PORT || 3000;

// Create Express server
const app = createServer();

// Start the server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`- API: http://localhost:${PORT}/api`);
      console.log(`- Admin Panel: http://localhost:${PORT}/admin`);
      console.log(`- Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();