import { ApiResponse, PaginatedResponse, Pagination } from '@/types/api';
import { LoginRequest, LoginResponse, RegisterRequest } from '@/types/auth';
import { Member, MemberStats, GetMembersParams } from '@/types/member';
import { DashboardStats, DashboardOverviewStats, MonthlyStats, MembershipDistribution, GenderDistribution, AgeDistribution, RecentActivity } from '@/types/dashboard';
import { Payment, PaymentStats, GetPaymentsParams } from '@/types/payment';
import { Workout, WorkoutStats, MemberWorkoutHistory, GetWorkoutsParams } from '@/types/workout';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('authToken');

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Auth API
export const authAPI = {
  login: (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
    apiCall<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

  register: (userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> =>
    apiCall<LoginResponse>('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),

  getProfile: (): Promise<ApiResponse<{ user: LoginResponse['user'] }>> =>
    apiCall<{ user: LoginResponse['user'] }>('/auth/me'),

  logout: (): Promise<ApiResponse<{ message: string }>> =>
    apiCall<{ message: string }>('/auth/logout', { method: 'POST' }),

  refreshToken: (): Promise<ApiResponse<{ token: string }>> =>
    apiCall<{ token: string }>('/auth/refresh', { method: 'POST' }),
};

// Members API
export const membersAPI = {
  getAll: (params?: GetMembersParams): Promise<ApiResponse<{ members: Member[]; pagination: Pagination }>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    const qs = searchParams.toString();
    return apiCall<{ members: Member[]; pagination: Pagination }>(qs ? `/members?${qs}` : '/members');
  },

  getById: (id: string): Promise<ApiResponse<{ member: Member & { checkIns: unknown[]; payments: Payment[]; workouts: Workout[] } }>> =>
    apiCall<{ member: Member & { checkIns: unknown[]; payments: Payment[]; workouts: Workout[] } }>(`/members/${id}`),

  create: (memberData: Omit<Member, 'id'>): Promise<ApiResponse<{ member: Member }>> =>
    apiCall<{ member: Member }>('/members', { method: 'POST', body: JSON.stringify(memberData) }),

  update: (id: string, memberData: Partial<Member>): Promise<ApiResponse<{ member: Member }>> =>
    apiCall<{ member: Member }>(`/members/${id}`, { method: 'PUT', body: JSON.stringify(memberData) }),

  delete: (id: string): Promise<ApiResponse<{ message: string }>> =>
    apiCall<{ message: string }>(`/members/${id}`, { method: 'DELETE' }),

  getStats: (id: string): Promise<ApiResponse<MemberStats>> =>
    apiCall<MemberStats>(`/members/${id}/stats`),
};

// Dashboard API
export const dashboardAPI = {
  getOverview: (): Promise<ApiResponse<DashboardOverviewStats>> =>
    apiCall<DashboardOverviewStats>('/dashboard/overview'),

  getMonthlyStats: (year?: number): Promise<ApiResponse<MonthlyStats[]>> => {
    const endpoint = year ? `/dashboard/monthly-stats?year=${year}` : '/dashboard/monthly-stats';
    return apiCall<MonthlyStats[]>(endpoint);
  },

  getMembershipDistribution: (): Promise<ApiResponse<MembershipDistribution[]>> =>
    apiCall<MembershipDistribution[]>('/dashboard/membership-distribution'),

  getGenderDistribution: (): Promise<ApiResponse<GenderDistribution[]>> =>
    apiCall<GenderDistribution[]>('/dashboard/gender-distribution'),

  getAgeDistribution: (): Promise<ApiResponse<AgeDistribution[]>> =>
    apiCall<AgeDistribution[]>('/dashboard/age-distribution'),

  getRecentActivities: (limit?: number): Promise<ApiResponse<RecentActivity[]>> => {
    const endpoint = limit ? `/dashboard/recent-activities?limit=${limit}` : '/dashboard/recent-activities';
    return apiCall<RecentActivity[]>(endpoint);
  },
};

// Payments API
export const paymentsAPI = {
  getAll: (params?: GetPaymentsParams): Promise<ApiResponse<PaginatedResponse<Payment>>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    const qs = searchParams.toString();
    return apiCall<PaginatedResponse<Payment>>(qs ? `/payments?${qs}` : '/payments');
  },

  getById: (id: string): Promise<ApiResponse<{ payment: Payment }>> =>
    apiCall<{ payment: Payment }>(`/payments/${id}`),

  create: (paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'member'>): Promise<ApiResponse<{ payment: Payment }>> =>
    apiCall<{ payment: Payment }>('/payments', { method: 'POST', body: JSON.stringify(paymentData) }),

  update: (id: string, paymentData: Partial<Payment>): Promise<ApiResponse<{ payment: Payment }>> =>
    apiCall<{ payment: Payment }>(`/payments/${id}`, { method: 'PUT', body: JSON.stringify(paymentData) }),

  delete: (id: string): Promise<ApiResponse<{ message: string }>> =>
    apiCall<{ message: string }>(`/payments/${id}`, { method: 'DELETE' }),

  markAsPaid: (id: string, data?: { amount?: number; notes?: string }): Promise<ApiResponse<{ payment: Payment }>> =>
    apiCall<{ payment: Payment }>(`/payments/${id}/mark-paid`, { method: 'PATCH', body: JSON.stringify(data || {}) }),

  getStats: (): Promise<ApiResponse<PaymentStats>> =>
    apiCall<PaymentStats>('/payments/stats/overview'),
};

// Workouts API
export const workoutsAPI = {
  getAll: (params?: GetWorkoutsParams): Promise<ApiResponse<PaginatedResponse<Workout>>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    const qs = searchParams.toString();
    return apiCall<PaginatedResponse<Workout>>(qs ? `/workouts?${qs}` : '/workouts');
  },

  getById: (id: string): Promise<ApiResponse<{ workout: Workout }>> =>
    apiCall<{ workout: Workout }>(`/workouts/${id}`),

  create: (workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt' | 'member'>): Promise<ApiResponse<{ workout: Workout }>> =>
    apiCall<{ workout: Workout }>('/workouts', { method: 'POST', body: JSON.stringify(workoutData) }),

  update: (id: string, workoutData: Partial<Workout>): Promise<ApiResponse<{ workout: Workout }>> =>
    apiCall<{ workout: Workout }>(`/workouts/${id}`, { method: 'PUT', body: JSON.stringify(workoutData) }),

  delete: (id: string): Promise<ApiResponse<{ message: string }>> =>
    apiCall<{ message: string }>(`/workouts/${id}`, { method: 'DELETE' }),

  getStats: (): Promise<ApiResponse<WorkoutStats>> =>
    apiCall<WorkoutStats>('/workouts/stats/overview'),

  getMemberHistory: (memberId: string, params?: { page?: number; limit?: number; startDate?: string; endDate?: string }): Promise<ApiResponse<MemberWorkoutHistory>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    const qs = searchParams.toString();
    const endpoint = qs ? `/workouts/member/${memberId}/history?${qs}` : `/workouts/member/${memberId}/history`;
    return apiCall<MemberWorkoutHistory>(endpoint);
  },
};

// Auth token management
export const tokenManager = {
  setToken: (token: string) => localStorage.setItem('authToken', token),
  getToken: () => localStorage.getItem('authToken'),
  removeToken: () => localStorage.removeItem('authToken'),
  isAuthenticated: () => !!localStorage.getItem('authToken'),
};

export default {
  auth: authAPI,
  members: membersAPI,
  dashboard: dashboardAPI,
  payments: paymentsAPI,
  workouts: workoutsAPI,
  tokenManager,
};
