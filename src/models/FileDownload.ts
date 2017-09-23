import {ReadStream} from 'fs';

export class FileDownload {
  stream: ReadStream;
  fileName: string;
  mimeType: string;
}
