/**
 * API-specific types
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
  requiresAuth?: boolean;
}

export interface ApiRequestOptions extends RequestConfig {
  endpoint: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadOptions {
  file: File;
  onProgress?: (progress: UploadProgress) => void;
  additionalData?: Record<string, any>;
}

