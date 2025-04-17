import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);

export class FileService {
  /**
   * Save uploaded file to disk
   * @param file - Uploaded file
   * @param folder - Destination folder
   * @returns Path to saved file
   */
  public async saveFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      // Generate unique filename
      const filename = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
      
      // Create destination directory if it doesn't exist
      const destDir = path.join(config.uploadDir, folder);
      await this.ensureDirectoryExists(destDir);
      
      // Create full path
      const filePath = path.join(destDir, filename);
      
      // Save file
      await fs.promises.writeFile(filePath, file.buffer);
      
      // Return relative path
      return path.join(folder, filename).replace(/\\/g, '/');
    } catch (error) {
      logger.error('Failed to save file', error);
      throw new Error('Failed to save file');
    }
  }

  /**
   * Save and process image
   * @param file - Uploaded image file
   * @param folder - Destination folder
   * @param options - Processing options
   * @returns Path to saved image
   */
  public async saveImage(
    file: Express.Multer.File,
    folder: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {}
  ): Promise<string> {
    try {
      // Generate unique filename
      const format = options.format || 'jpeg';
      const filename = `${uuidv4()}-${Date.now()}.${format}`;
      
      // Create destination directory if it doesn't exist
      const destDir = path.join(config.uploadDir, folder);
      await this.ensureDirectoryExists(destDir);
      
      // Create full path
      const filePath = path.join(destDir, filename);
      
      // Process image with sharp
      let sharpInstance = sharp(file.buffer);
      
      // Resize if dimensions provided
      if (options.width || options.height) {
        sharpInstance = sharpInstance.resize({
          width: options.width,
          height: options.height,
          fit: 'inside',
          withoutEnlargement: true
        });
      }
      
      // Set format and quality
      switch (format) {
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ quality: options.quality || 80 });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality: options.quality || 80 });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality: options.quality || 80 });
          break;
      }
      
      // Save processed image
      await sharpInstance.toFile(filePath);
      
      // Return relative path
      return path.join(folder, filename).replace(/\\/g, '/');
    } catch (error) {
      logger.error('Failed to save image', error);
      throw new Error('Failed to save image');
    }
  }

  /**
   * Create thumbnail from image
   * @param filePath - Path to original image
   * @param folder - Destination folder
   * @param width - Thumbnail width
   * @param height - Thumbnail height
   * @returns Path to thumbnail
   */
  public async createThumbnail(
    filePath: string,
    folder: string,
    width: number = 200,
    height: number = 200
  ): Promise<string> {
    try {
      // Generate filename for thumbnail
      const originalPath = path.join(config.uploadDir, filePath);
      const filename = `thumb-${path.basename(filePath)}`;
      
      // Create destination directory if it doesn't exist
      const destDir = path.join(config.uploadDir, folder);
      await this.ensureDirectoryExists(destDir);
      
      // Create full path for thumbnail
      const thumbPath = path.join(destDir, filename);
      
      // Create thumbnail with sharp
      await sharp(originalPath)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .toFile(thumbPath);
      
      // Return relative path
      return path.join(folder, filename).replace(/\\/g, '/');
    } catch (error) {
      logger.error('Failed to create thumbnail', error);
      throw new Error('Failed to create thumbnail');
    }
  }

  /**
   * Delete file from disk
   * @param filePath - Path to file
   * @returns True if deleted
   */
  public async deleteFile(filePath: string): Promise<boolean> {
    try {
      // Check if filePath is a URL
      if (filePath.startsWith('http')) {
        // Extract pathname from URL
        const url = new URL(filePath);
        filePath = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
      }
      
      // Get full path
      const fullPath = path.join(config.uploadDir, filePath);
      
      // Check if file exists
      if (fs.existsSync(fullPath)) {
        await unlink(fullPath);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to delete file', error);
      return false;
    }
  }

  /**
   * Ensure directory exists
   * @param dirPath - Directory path
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.promises.access(dirPath);
    } catch (error) {
      await mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Get file mime type from extension
   * @param filename - Filename
   * @returns Mime type
   */
  public getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.csv': 'text/csv',
      '.txt': 'text/plain'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }
}