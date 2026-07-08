/**
 * Shared TypeScript types and interfaces
 */

export interface User {
  id: string;
  email: string;
  username?: string;
  name: string;
  role?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
}

export interface StegoOperation {
  id: string;
  user_id: string;
  job_id: string;
  operation_type: 'embed' | 'extract';
  original_filename: string;
  output_filename?: string;
  message_preview?: string;
  status: 'PENDING' | 'PROGRESS' | 'SUCCESS' | 'FAILURE';
  created_at: string;
  completed_at?: string;
  error_message?: string;
  result?: {
    message?: string;
    output_path?: string;
    [key: string]: any;
  };
  error?: string;
  progress?: number;
}

export interface EmbedRequest {
  message: string;
  architecture?: 'dense' | 'basic';
}

export interface ExtractRequest {
  architecture?: 'dense' | 'basic';
}

export interface JobResponse {
  job_id: string;
  status: 'PENDING' | 'PROGRESS' | 'SUCCESS' | 'FAILURE';
  message?: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: 'PENDING' | 'PROGRESS' | 'SUCCESS' | 'FAILURE';
  progress?: number;
  result?: {
    message?: string;
    output_path?: string;
    [key: string]: any;
  };
  error?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  message?: string;
}

