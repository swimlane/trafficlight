import {ReadStream} from 'fs';

/**
 * Return type when serving a file.
 */
export class FileDownload {

  /**
   * The download stream.
   */
  stream: ReadStream;

  /**
   * File name for download.
   */
  fileName: string;

  /**
   * File mime type.
   */
  mimeType: string;
}
