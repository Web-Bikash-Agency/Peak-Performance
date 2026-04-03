import { useState } from 'react';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardAPI, membersAPI, paymentsAPI } from '@/services/api';
import { Member } from '@/types/member';
import { DashboardOverviewStats, MonthlyStats } from '@/types/dashboard';
import { PaymentStats } from '@/types/payment';

// Query keys — centralised so invalidations always match
export const queryKeys = {
  dashboardOverview: ['dashboard', 'overview'] as const,
  dashboardMonthly: (year?: number) => ['dashboard', 'monthly', year] as const,
  members: (page: number, limit: number, filters: object) =>
    ['members', page, limit, filters] as const,
  paymentStats: ['payments', 'stats'] as const,
};

export function useDashboardData(year?: number) {
  const overviewQuery = useQuery({
    queryKey: queryKeys.dashboardOverview,
    queryFn: () => dashboardAPI.getOverview().then(r => r.data),
    staleTime: 0,                  // always re-fetch on mount
    refetchInterval: 60 * 1000,   // silently re-fetch every 60 seconds
  });

  const monthlyQuery = useQuery({
    queryKey: queryKeys.dashboardMonthly(year),
    queryFn: () => dashboardAPI.getMonthlyStats(year).then(r => r.data),
    staleTime: 5 * 60 * 1000, // monthly charts change less often
  });

  return {
    stats: (overviewQuery.data as DashboardOverviewStats) ?? null,
    monthlyStats: (monthlyQuery.data as MonthlyStats[]) ?? [],
    loading: overviewQuery.isLoading || monthlyQuery.isLoading,
    error: overviewQuery.error?.message || monthlyQuery.error?.message || null,
  };
}

const PAGE_SIZE = 12;

export function usePaymentStats() {
  const query = useQuery({
    queryKey: queryKeys.paymentStats,
    queryFn: () => paymentsAPI.getStats().then(r => r.data),
    staleTime: 60 * 1000,
  });

  return {
    paymentStats: (query.data as PaymentStats) ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
  };
}

export function useMembers() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<Record<string, string>>({});

  const query = useInfiniteQuery({
    queryKey: queryKeys.members(1, PAGE_SIZE, filters),
    queryFn: ({ pageParam = 1 }) =>
      membersAPI
        .getAll({ page: pageParam as number, limit: PAGE_SIZE, ...filters })
        .then(r => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    staleTime: 60 * 1000,
  });

  const invalidate = () => Promise.all([
    qc.invalidateQueries({ queryKey: ['members'] }),
    qc.invalidateQueries({ queryKey: queryKeys.dashboardOverview }),
  ]);

  // Flatten all loaded pages into a single list
  const pages = query.data?.pages ?? [];
  const members: Member[] = pages.flatMap(p => p.members) ?? [];
  const lastPage = pages[pages.length - 1];
  const total: number = lastPage?.pagination.total ?? 0;

  const fetchMembers = (_page = 1, _limit = PAGE_SIZE, newFilters: Record<string, string> = {}) => {
    setFilters(newFilters);
  };

  const addMember = useMutation({
    mutationFn: (memberData: Omit<Member, 'id'>) => membersAPI.create(memberData),
    onSuccess: invalidate,
  });

  const updateMember = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Member> }) =>
      membersAPI.update(id, data),
    onSuccess: invalidate,
  });

  const deleteMember = useMutation({
    mutationFn: (id: string) => membersAPI.delete(id),
    onSuccess: invalidate,
  });

  return {
    members,
    total,
    loading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error?.message ?? null,
    fetchMembers,
    addMember: (data: Omit<Member, 'id'>) => addMember.mutateAsync(data),
    updateMember: (id: string, data: Partial<Member>) => updateMember.mutateAsync({ id, data }),
    deleteMember: (id: string) => deleteMember.mutateAsync(id),
  };
}
