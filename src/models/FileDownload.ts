/**
 * Return type when serving a file.
 */
export class FileDownload {

  /**
   * Creates an instance of FileDownload.
   *
   * @param {*} file any type that is returnable by your webserver (string, Buffer, Stream, etc)
   * @param {string} fileName The name of the file
   * @param {string} mimeType The mime type of the file
   * @memberof FileDownload
   */
  constructor(public file: any, public fileName: string, public mimeType: string) { }
}
