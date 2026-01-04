
export interface FileObject {
  id: string;
  file: File;
  name: string;
  type: string;
  size: number;
  previewUrl?: string;
  rotation: number;
  pageCount?: number;
}

export interface PageObject {
  id: string;
  originalIndex: number; // 0-based
  previewUrl: string;
  rotation: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export enum AppMode {
  MERGE = 'MERGE',
  COMPRESS = 'COMPRESS',
  SPLIT = 'SPLIT',
  ORGANIZE = 'ORGANIZE'
}

export enum CompressionLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CUSTOM = 'CUSTOM'
}

export interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  percentage: number;
}

export interface PdfMetadata {
  title: string;
  author: string;
  addPageNumbers: boolean;
  watermark?: string;
  password?: string;
  grayscale?: boolean;
}

export interface ProcessedFile {
  name: string;
  blob: Blob;
}
