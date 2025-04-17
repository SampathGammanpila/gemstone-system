// Type definitions for Express Multer
declare namespace Express {
  namespace Multer {
    interface File {
      /** Field name specified in the form */
      fieldname: string;
      /** Original filename of the uploaded file */
      originalname: string;
      /** Encoding type of the file */
      encoding: string;
      /** MIME type of the file */
      mimetype: string;
      /** Size of the file in bytes */
      size: number;
      /** The folder to which the file has been saved */
      destination: string;
      /** The name of the file within the destination */
      filename: string;
      /** Location of the uploaded file */
      path: string;
      /** A Buffer of the entire file */
      buffer: Buffer;
    }
  }
}