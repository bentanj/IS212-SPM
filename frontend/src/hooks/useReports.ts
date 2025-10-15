/**
 * Custom React Hook for Reports
 * Provides easy access to report data with loading and error states
 */

import { useState, useEffect, useCallback } from 'react';
import {
  reportService,
  ReportServiceError,
} from '@/services/reportService';
import type {
  TaskCompletionReport,
  ProjectPerformanceReport,
  TeamProductivityReport,
  ReportsSummary,
  AvailableReport,
} from '@/types/report.types';

interface UseReportState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTaskCompletionReport(useCache = false): UseReportState<TaskCompletionReport> {
  const [data, setData] = useState<TaskCompletionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const report = await reportService.getTaskCompletionReport(useCache);
      setData(report);
    } catch (err) {
      const message = err instanceof ReportServiceError ? err.message : 'Failed to fetch report';
      setError(message);
      console.error('Error fetching task completion report:', err);
    } finally {
      setLoading(false);
    }
  }, [useCache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useProjectPerformanceReport(useCache = false): UseReportState<ProjectPerformanceReport> {
  const [data, setData] = useState<ProjectPerformanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const report = await reportService.getProjectPerformanceReport(useCache);
      setData(report);
    } catch (err) {
      const message = err instanceof ReportServiceError ? err.message : 'Failed to fetch report';
      setError(message);
      console.error('Error fetching project performance report:', err);
    } finally {
      setLoading(false);
    }
  }, [useCache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useTeamProductivityReport(useCache = false): UseReportState<TeamProductivityReport> {
  const [data, setData] = useState<TeamProductivityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const report = await reportService.getTeamProductivityReport(useCache);
      setData(report);
    } catch (err) {
      const message = err instanceof ReportServiceError ? err.message : 'Failed to fetch report';
      setError(message);
      console.error('Error fetching team productivity report:', err);
    } finally {
      setLoading(false);
    }
  }, [useCache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useReportsSummary(useCache = true): UseReportState<ReportsSummary> {
  const [data, setData] = useState<ReportsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await reportService.getReportsSummary(useCache);
      setData(summary);
    } catch (err) {
      const message = err instanceof ReportServiceError ? err.message : 'Failed to fetch summary';
      setError(message);
      console.error('Error fetching reports summary:', err);
    } finally {
      setLoading(false);
    }
  }, [useCache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useAvailableReports(useCache = true): UseReportState<AvailableReport[]> {
  const [data, setData] = useState<AvailableReport[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const reports = await reportService.getAvailableReports(useCache);
      setData(reports);
    } catch (err) {
      const message = err instanceof ReportServiceError ? err.message : 'Failed to fetch reports';
      setError(message);
      console.error('Error fetching available reports:', err);
    } finally {
      setLoading(false);
    }
  }, [useCache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
