import { useState, useEffect } from 'react';
import { dashboardAPI, membersAPI } from '@/services/api';
import { DashboardStats, Member, MonthlyStats } from '@/types/member';

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard overview
        const overviewResponse = await dashboardAPI.getOverview();
        setStats(overviewResponse.data);

        // Fetch monthly stats
        const monthlyResponse = await dashboardAPI.getMonthlyStats();
        setMonthlyStats(monthlyResponse.data);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { stats, monthlyStats, loading, error };
}

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchMembers = async (page = 1, limit = 10, filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await membersAPI.getAll(page, limit, filters);
      setMembers(response.data.members);
      setPagination(response.data.pagination);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
      console.error('Members fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (memberData: Omit<Member, 'id'>) => {
    try {
      const response = await membersAPI.create(memberData);
      // Refresh the current page
      await fetchMembers(pagination.page, pagination.limit);
      return response;
    } catch (err) {
      throw err;
    }
  };

  const updateMember = async (id: string, memberData: Partial<Member>) => {
    try {
      const response = await membersAPI.update(id, memberData);
      // Refresh the current page
      await fetchMembers(pagination.page, pagination.limit);
      return response;
    } catch (err) {
      throw err;
    }
  };

  const deleteMember = async (id: string) => {
    try {
      await membersAPI.delete(id);
      // Refresh the current page
      await fetchMembers(pagination.page, pagination.limit);
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return {
    members,
    loading,
    error,
    pagination,
    fetchMembers,
    addMember,
    updateMember,
    deleteMember
  };
}
