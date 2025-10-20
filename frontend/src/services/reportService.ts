/**
 * Reports API Service
 * Handles all API calls to the Reports backend service
 */

import {
  TaskCompletionReport,
  ProjectPerformanceReport,
  TeamProductivityReport,
  ReportsSummary,
  AvailableReport,
  ApiError,
} from '@/types/report.types';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'; 
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003';
const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Cache configuration
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class ReportCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.expiresIn;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

const cache = new ReportCache();

// Custom error class
export class ReportServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ReportServiceError';
  }
}

// Helper: Delay for retry
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ReportServiceError('Request timeout', 408);
    }
    throw error;
  }
}

// Helper: Retry logic
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'Unknown error',
          message: response.statusText,
        }));

        throw new ReportServiceError(
          errorData.message || errorData.error || 'API request failed',
          response.status,
          errorData
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx)
      if (error instanceof ReportServiceError && error.statusCode && error.statusCode < 500) {
        throw error;
      }

      // Retry on server errors (5xx) or network errors
      if (attempt < retries) {
        console.warn(`Retry attempt ${attempt + 1}/${retries} for ${url}`);
        await delay(RETRY_DELAY * (attempt + 1)); // Exponential backoff
      }
    }
  }

  throw lastError || new ReportServiceError('Max retries exceeded');
}

// API Service Class
export class ReportService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Health check endpoint
   */
  async checkHealth(): Promise<{ status: string; service: string; port: number }> {
    const url = `${this.baseUrl}/api/reports/health`;
    return fetchWithRetry(url);
  }

  /**
   * Get list of available report types
   */
  async getAvailableReports(useCache = true): Promise<AvailableReport[]> {
    const cacheKey = 'available-reports';

    if (useCache) {
      const cached = cache.get<AvailableReport[]>(cacheKey);
      if (cached) return cached;
    }

    const url = `${this.baseUrl}/api/reports`;
    const data = await fetchWithRetry<AvailableReport[]>(url);

    cache.set(cacheKey, data, 10 * 60 * 1000); // Cache for 10 minutes
    return data;
  }

  /**
   * Get task completion/status report data
   */
  async getTaskCompletionReport(useCache = false): Promise<TaskCompletionReport> {
    const cacheKey = 'task-completion-report';

    if (useCache) {
      const cached = cache.get<TaskCompletionReport>(cacheKey);
      if (cached) return cached;
    }

    const url = `${this.baseUrl}/api/reports/task-completion/data`;
    const data = await fetchWithRetry<TaskCompletionReport>(url);

    if (useCache) {
      cache.set(cacheKey, data, 2 * 60 * 1000); // Cache for 2 minutes
    }

    return data;
  }

  /**
   * Get project performance analytics report data
   */
  async getProjectPerformanceReport(useCache = false): Promise<ProjectPerformanceReport> {
    const cacheKey = 'project-performance-report';

    if (useCache) {
      const cached = cache.get<ProjectPerformanceReport>(cacheKey);
      if (cached) return cached;
    }

    const url = `${this.baseUrl}/api/reports/project-performance/data`;
    const data = await fetchWithRetry<ProjectPerformanceReport>(url);

    if (useCache) {
      cache.set(cacheKey, data, 2 * 60 * 1000);
    }

    return data;
  }

  /**
   * Get team productivity report data
   */
  async getTeamProductivityReport(useCache = false): Promise<TeamProductivityReport> {
    const cacheKey = 'team-productivity-report';

    if (useCache) {
      const cached = cache.get<TeamProductivityReport>(cacheKey);
      if (cached) return cached;
    }

    const url = `${this.baseUrl}/api/reports/team-productivity/data`;
    const data = await fetchWithRetry<TeamProductivityReport>(url);

    if (useCache) {
      cache.set(cacheKey, data, 2 * 60 * 1000);
    }

    return data;
  }

  /**
   * Get reports summary (high-level metrics)
   */
  async getReportsSummary(useCache = true): Promise<ReportsSummary> {
    const cacheKey = 'reports-summary';

    if (useCache) {
      const cached = cache.get<ReportsSummary>(cacheKey);
      if (cached) return cached;
    }

    const url = `${this.baseUrl}/api/reports/summary`;
    const data = await fetchWithRetry<ReportsSummary>(url);

    if (useCache) {
      cache.set(cacheKey, data, 1 * 60 * 1000); // Cache for 1 minute
    }

    return data;
  }

  /**
   * Clear cache
   */
  clearCache(key?: string): void {
    cache.clear(key);
  }
}

// Export singleton instance
export const reportService = new ReportService();

// Export individual functions for easier imports
export const {
  checkHealth,
  getAvailableReports,
  getTaskCompletionReport,
  getProjectPerformanceReport,
  getTeamProductivityReport,
  getReportsSummary,
  clearCache,
} = reportService;
