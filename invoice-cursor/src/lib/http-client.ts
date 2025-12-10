/**
 * HTTP Client Wrapper (Axios) - Singleton Pattern
 * 
 * Provides a configured Axios instance with interceptors for:
 * - Request/response logging
 * - Error handling
 * - Request timeout
 * - Base URL configuration
 * 
 * Uses singleton pattern to ensure only one HTTP client instance exists.
 * 
 * @example
 * ```typescript
 * import { HttpClient } from '@/lib/http-client';
 * 
 * const httpClient = HttpClient.getInstance();
 * 
 * // GET request
 * const response = await httpClient.get('/api/invoices');
 * 
 * // POST request
 * const response = await httpClient.post('/api/invoices', { vendorName: 'Acme' });
 * ```
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from './config';
import { Logger } from './logger';

/**
 * HTTP Client Singleton Class
 * 
 * Ensures only one HTTP client instance exists throughout the application.
 */
class HttpClient {
  private static instance: HttpClient;
  private axiosInstance: AxiosInstance;
  private logger: Logger;

  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {
    this.logger = Logger.getInstance();

    // Create Axios instance with default configuration
    this.axiosInstance = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeoutMs,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Get the singleton instance of HttpClient
   * 
   * @returns The singleton HttpClient instance
   */
  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (requestConfig) => {
        // Log request in development or debug mode
        if (config.app.isDevelopment || config.app.logLevel === 'debug') {
          this.logger.debug('HTTP Request', {
            method: requestConfig.method?.toUpperCase(),
            url: requestConfig.url,
            baseURL: requestConfig.baseURL,
            headers: requestConfig.headers,
            ...(requestConfig.data && { data: requestConfig.data }),
          });
        }

        return requestConfig;
      },
      (error) => {
        this.logger.error('HTTP Request Error', { error: error.message, stack: error.stack });
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful responses in development or debug mode
        if (config.app.isDevelopment || config.app.logLevel === 'debug') {
          this.logger.debug('HTTP Response', {
            method: response.config.method?.toUpperCase(),
            url: response.config.url,
            status: response.status,
            statusText: response.statusText,
            ...(response.data && { data: response.data }),
          });
        }

        return response;
      },
      (error: AxiosError) => {
        // Handle Axios errors
        if (error.response) {
          // Server responded with error status
          this.logger.warn('HTTP Response Error', {
            method: error.config?.method?.toUpperCase(),
            url: error.config?.url,
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          });
        } else if (error.request) {
          // Request was made but no response received
          this.logger.error('HTTP Request Timeout/Network Error', {
            method: error.config?.method?.toUpperCase(),
            url: error.config?.url,
            message: error.message,
          });
        } else {
          // Error setting up the request
          this.logger.error('HTTP Request Setup Error', {
            message: error.message,
            stack: error.stack,
          });
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Get the underlying Axios instance
   * 
   * Usage:
   * - httpClient.getAxiosInstance().get(url, config)
   * - httpClient.getAxiosInstance().post(url, data, config)
   * - httpClient.getAxiosInstance().put(url, data, config)
   * - httpClient.getAxiosInstance().patch(url, data, config)
   * - httpClient.getAxiosInstance().delete(url, config)
   */
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Convenience methods that delegate to Axios instance
   */
  public get<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.get<T>(url, config);
  }

  public post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.axiosInstance.post<T>(url, data, config);
  }

  public put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.axiosInstance.put<T>(url, data, config);
  }

  public patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  public delete<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.delete<T>(url, config);
  }
}

/**
 * Export singleton instance for convenience
 * 
 * Usage:
 * - httpClient.get(url, config)
 * - httpClient.post(url, data, config)
 * - httpClient.put(url, data, config)
 * - httpClient.patch(url, data, config)
 * - httpClient.delete(url, config)
 */
export const httpClient = HttpClient.getInstance();

/**
 * Export HttpClient class for advanced usage
 */
export { HttpClient };

/**
 * Helper function to extract error message from Axios error
 * 
 * @param error - Axios error
 * @returns User-friendly error message
 */
export function getAxiosErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      // Try to extract message from response data
      const data = error.response.data;
      if (typeof data === 'object' && data !== null) {
        if ('error' in data && typeof data.error === 'object' && data.error !== null) {
          if ('message' in data.error && typeof data.error.message === 'string') {
            return data.error.message;
          }
        }
        if ('message' in data && typeof data.message === 'string') {
          return data.message;
        }
      }
      if (typeof data === 'string') {
        return data;
      }
    }
    if (error.request) {
      return 'Network error: Unable to reach the server';
    }
    return error.message || 'An unexpected error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

