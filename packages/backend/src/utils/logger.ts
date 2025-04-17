import winston from 'winston';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from '../config/environment';

// Define custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log level based on environment
const level = () => {
  return config.logLevel;
};

// Define colors for console output
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Define log formats
const formatPrint = winston.format.printf(
  (info) => {
    const { level, message, timestamp, ...meta } = info;
    
    let metaStr = '';
    
    if (Object.keys(meta).length > 0) {
      if (meta.stack) {
        metaStr = `\n${meta.stack}`;
      } else {
        try {
          metaStr = `\n${JSON.stringify(meta, null, 2)}`;
        } catch (error) {
          metaStr = '';
        }
      }
    }
    
    return `[${timestamp || new Date().toISOString()}] ${level}: ${message}${metaStr}`;
  }
);

// Console format
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  formatPrint
);

// File format
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// Define transport for daily rotation of log files
const fileTransport = new DailyRotateFile({
  dirname: path.join(process.cwd(), 'logs'),
  filename: '%DATE%-app.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
}) as winston.transport;

// Define transports as an array of winston.transport
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// Add file transport in production or if explicitly enabled
if (config.nodeEnv === 'production' || process.env.ENABLE_LOG_FILES === 'true') {
  transports.push(fileTransport);
  
  // Add separate error log in production
  transports.push(
    new DailyRotateFile({
      dirname: path.join(process.cwd(), 'logs'),
      filename: '%DATE%-error.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
      format: fileFormat,
    }) as winston.transport
  );
}

// Create Winston logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  exitOnError: false,
});

// Export a stream object for Morgan
export const stream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};