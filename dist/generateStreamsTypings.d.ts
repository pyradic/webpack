import { ConnectionOptions } from 'mysqldump';
export interface GenerateStreamsTypingsOptions {
    filePath?: string;
    connection?: Partial<ConnectionOptions>;
}
export declare function generateStreamsTypings(options?: GenerateStreamsTypingsOptions): Promise<string>;
