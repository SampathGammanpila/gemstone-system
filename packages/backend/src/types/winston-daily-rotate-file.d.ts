// src/types/winston-daily-rotate-file.d.ts
declare module 'winston-daily-rotate-file' {
    import { transport } from 'winston';
    interface DailyRotateFileTransportOptions {
      dirname?: string;
      filename?: string;
      datePattern?: string;
      zippedArchive?: boolean;
      maxSize?: string;
      maxFiles?: string;
      format?: any;
      level?: string;
    }
    
    class DailyRotateFileTransport extends transport {
      constructor(options?: DailyRotateFileTransportOptions);
    }
    
    export = DailyRotateFileTransport;
  }