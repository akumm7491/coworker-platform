import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createReadStream, createWriteStream } from 'fs';
import { mkdir, stat, unlink } from 'fs/promises';
import { resolve, dirname } from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import logger from '../../../utils/logger.js';

export interface StorageOptions {
  provider: 's3' | 'local';
  s3?: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
  };
  local?: {
    directory: string;
  };
}

export interface FileMetadata {
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url?: string;
  metadata?: Record<string, any>;
}

export class StorageService {
  private static instance: StorageService;
  private s3Client?: S3Client;
  private localDirectory?: string;
  private provider: 's3' | 'local';

  private constructor() {
    this.provider = 'local';
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async initialize(options: StorageOptions): Promise<void> {
    this.provider = options.provider;

    if (options.provider === 's3' && options.s3) {
      this.s3Client = new S3Client({
        region: options.s3.region,
        credentials: {
          accessKeyId: options.s3.accessKeyId,
          secretAccessKey: options.s3.secretAccessKey,
        },
        endpoint: options.s3.endpoint,
      });
    } else if (options.provider === 'local' && options.local) {
      this.localDirectory = resolve(process.cwd(), options.local.directory);
      await mkdir(this.localDirectory, { recursive: true });
    }
  }

  async uploadFile(
    file: Buffer | Readable | string,
    path: string,
    metadata: Partial<FileMetadata>,
  ): Promise<FileMetadata> {
    try {
      if (this.provider === 's3') {
        return this.uploadToS3(file, path, metadata);
      } else {
        return this.uploadToLocal(file, path, metadata);
      }
    } catch (error) {
      logger.error('Error uploading file:', error);
      throw error;
    }
  }

  async downloadFile(path: string): Promise<Buffer> {
    try {
      if (this.provider === 's3') {
        return this.downloadFromS3(path);
      } else {
        return this.downloadFromLocal(path);
      }
    } catch (error) {
      logger.error('Error downloading file:', error);
      throw error;
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      if (this.provider === 's3') {
        await this.deleteFromS3(path);
      } else {
        await this.deleteFromLocal(path);
      }
    } catch (error) {
      logger.error('Error deleting file:', error);
      throw error;
    }
  }

  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    if (this.provider !== 's3') {
      throw new Error('Signed URLs are only supported for S3 storage');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: path,
      });

      return getSignedUrl(this.s3Client!, command, { expiresIn });
    } catch (error) {
      logger.error('Error generating signed URL:', error);
      throw error;
    }
  }

  private async uploadToS3(
    file: Buffer | Readable | string,
    path: string,
    metadata: Partial<FileMetadata>,
  ): Promise<FileMetadata> {
    const body = typeof file === 'string' ? createReadStream(file) : file;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: path,
      Body: body,
      ContentType: metadata.mimetype,
      Metadata: metadata.metadata,
    });

    await this.s3Client!.send(command);

    return {
      filename: metadata.filename || path.split('/').pop() || '',
      mimetype: metadata.mimetype || 'application/octet-stream',
      size: metadata.size || 0,
      path,
      metadata: metadata.metadata,
    };
  }

  private async uploadToLocal(
    file: Buffer | Readable | string,
    path: string,
    metadata: Partial<FileMetadata>,
  ): Promise<FileMetadata> {
    const fullPath = resolve(this.localDirectory!, path);
    await mkdir(dirname(fullPath), { recursive: true });

    if (typeof file === 'string') {
      // File path
      const sourceStream = createReadStream(file);
      const targetStream = createWriteStream(fullPath);
      await pipeline(sourceStream, targetStream);
    } else if (Buffer.isBuffer(file)) {
      // Buffer
      await pipeline(Readable.from(file), createWriteStream(fullPath));
    } else {
      // Readable stream
      await pipeline(file, createWriteStream(fullPath));
    }

    const stats = await stat(fullPath);

    return {
      filename: metadata.filename || path.split('/').pop() || '',
      mimetype: metadata.mimetype || 'application/octet-stream',
      size: stats.size,
      path,
      metadata: metadata.metadata,
    };
  }

  private async downloadFromS3(path: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: path,
    });

    const response = await this.s3Client!.send(command);
    const chunks: Buffer[] = [];

    for await (const chunk of response.Body as Readable) {
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  }

  private async downloadFromLocal(path: string): Promise<Buffer> {
    const fullPath = resolve(this.localDirectory!, path);
    return pipeline(createReadStream(fullPath), async function* (source) {
      const chunks: Buffer[] = [];
      for await (const chunk of source) {
        chunks.push(Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    });
  }

  private async deleteFromS3(path: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: path,
    });

    await this.s3Client!.send(command);
  }

  private async deleteFromLocal(path: string): Promise<void> {
    const fullPath = resolve(this.localDirectory!, path);
    await unlink(fullPath);
  }
}

export const storageService = StorageService.getInstance();
