/// <reference types="node" />
import { ReadStream } from 'fs';
export declare class FileDownload {
    stream: ReadStream;
    fileName: string;
    mimeType: string;
}
