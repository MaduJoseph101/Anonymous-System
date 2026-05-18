import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const useReports = (filters = {}) => {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ 
    total: 0, page: 1, pages: 1, limit: 20 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.admin.getReports(filters);
      setReports(response.data?.reports || response.reports || []);
      setPagination(response.data?.pagination || response.pagination || { total: 0, page: 1, pages: 1, limit: 20 });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { reports, pagination, loading, error, refetch: fetchReports };
};

export default useReports;
