/**
 * Return type when serving a file.
 */
export class FileDownload {
  /**
   * The download stream.
   */
  file: any;

  /**
   * File name for download.
   */
  fileName: string;

  /**
   * File mime type.
   */
  mimeType: string;

  /**
   * Creates an instance of FileDownload.
   *
   * @param {*} _file any type that is returnable by your webserver (string, Buffer, Stream, etc)
   * @param {string} _fileName The name of the file
   * @param {string} _mimeType The mime type of the file
   * @memberof FileDownload
   */
  constructor(_file: any, _fileName: string, _mimeType: string) {
    // old school assignment until tswag supports constructor documentation
    this.file = _file;
    this.fileName = _fileName;
    this.mimeType = _mimeType;
  }
}
