// src/services/reportService.ts
import {
  ProjectPerformanceReport,
  UserProductivityReport,
  ReportsSummary,
  ApiError,
} from '@/types/report.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_TIMEOUT = 30000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Cache configuration
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class ReportCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000;

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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ReportServiceError('Request timeout', 408);
      }
      // Network error
      throw new ReportServiceError(
        'Failed to connect to reports service. Please ensure the backend is running.',
        0,
        { originalError: error.message }
      );
    }
    throw error;
  }
}

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Fetching: ${url} (attempt ${attempt + 1}/${retries + 1})`);
      const response = await fetchWithTimeout(url, options);

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
      console.log('API Response:', data);
      return data as T;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error);

      if (error instanceof ReportServiceError && error.statusCode && error.statusCode < 500) {
        throw error;
      }

      if (attempt < retries) {
        console.warn(`Retry attempt ${attempt + 1}/${retries} for ${url}`);
        await delay(RETRY_DELAY * (attempt + 1));
      }
    }
  }

  throw lastError || new ReportServiceError('Max retries exceeded');
}

export class ReportService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    console.log('ReportService initialized with base URL:', this.baseUrl);
  }

  async checkHealth(): Promise<{ status: string; service: string; port: number }> {
    const url = `${this.baseUrl}/api/reports/health`;
    return fetchWithRetry(url);
  }

  async getProjectPerformanceReport(
    startDate: string,
    endDate: string,
    useCache = false
  ): Promise<ProjectPerformanceReport> {
    const cacheKey = `project-performance-${startDate}-${endDate}`;
    if (useCache) {
      const cached = cache.get<ProjectPerformanceReport>(cacheKey);
      if (cached) {
        console.log('Returning cached project performance report');
        return cached;
      }
    }

    const url = `${this.baseUrl}/api/reports/project-performance/data?start_date=${startDate}&end_date=${endDate}`;
    const data = await fetchWithRetry<ProjectPerformanceReport>(url);
    
    if (useCache) {
      cache.set(cacheKey, data, 2 * 60 * 1000);
    }

    return data;
  }

  async getUserProductivityReport(
    startDate: string,
    endDate: string,
    useCache = false
  ): Promise<UserProductivityReport> {
    const cacheKey = `user-productivity-${startDate}-${endDate}`;
    if (useCache) {
      const cached = cache.get<UserProductivityReport>(cacheKey);
      if (cached) {
        console.log('Returning cached user productivity report');
        return cached;
      }
    }

    const url = `${this.baseUrl}/api/reports/user-productivity/data?start_date=${startDate}&end_date=${endDate}`;
    const data = await fetchWithRetry<UserProductivityReport>(url);
    
    if (useCache) {
      cache.set(cacheKey, data, 2 * 60 * 1000);
    }

    return data;
  }

  async getReportsSummary(useCache = true): Promise<ReportsSummary> {
    const cacheKey = 'reports-summary';
    if (useCache) {
      const cached = cache.get<ReportsSummary>(cacheKey);
      if (cached) return cached;
    }

    const url = `${this.baseUrl}/api/reports/summary`;
    const data = await fetchWithRetry<ReportsSummary>(url);
    if (useCache) {
      cache.set(cacheKey, data, 1 * 60 * 1000);
    }

    return data;
  }

  clearCache(key?: string): void {
    cache.clear(key);
  }
}

export const reportService = new ReportService();

export const {
  checkHealth,
  getProjectPerformanceReport,
  getUserProductivityReport,
  getReportsSummary,
  clearCache,
} = reportService;
