import { Member, MonthlyStats, DashboardStats } from '@/types/member';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API Response types
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth types
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Utility function for API calls
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
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiCall<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiCall<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getProfile: async (): Promise<ApiResponse<{ user: any }>> => {
    return apiCall<{ user: any }>('/auth/me');
  },

  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },

  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    return apiCall<{ token: string }>('/auth/refresh', {
      method: 'POST',
    });
  },
};

// Members API
export const membersAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    membershipType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<Member>>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/members?${queryString}` : '/members';
    
    return apiCall<PaginatedResponse<Member>>(endpoint);
  },

  getById: async (id: string): Promise<ApiResponse<{ member: Member & { 
    checkIns: any[];
    payments: any[];
    workouts: any[];
  } }>> => {
    return apiCall<{ member: Member & { 
      checkIns: any[];
      payments: any[];
      workouts: any[];
    } }>(`/members/${id}`);
  },

  create: async (memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<{ member: Member }>> => {
    return apiCall<{ member: Member }>('/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  },

  update: async (id: string, memberData: Partial<Member>): Promise<ApiResponse<{ member: Member }>> => {
    return apiCall<{ member: Member }>(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  },

  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>(`/members/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async (id: string): Promise<ApiResponse<{
    checkInCount: number;
    paymentCount: number;
    totalPaid: number;
    workoutCount: number;
    totalWorkoutDuration: number;
    totalCalories: number;
  }>> => {
    return apiCall<{
      checkInCount: number;
      paymentCount: number;
      totalPaid: number;
      workoutCount: number;
      totalWorkoutDuration: number;
      totalCalories: number;
    }>(`/members/${id}/stats`);
  },
};

// Dashboard API
export const dashboardAPI = {
  getOverview: async (): Promise<ApiResponse<DashboardStats & {
    todayCheckIns: number;
    monthlyRevenue: number;
    newMembersThisMonth: number;
  }>> => {
    return apiCall<DashboardStats & {
      todayCheckIns: number;
      monthlyRevenue: number;
      newMembersThisMonth: number;
    }>('/dashboard/overview');
  },

  getMonthlyStats: async (year?: number): Promise<ApiResponse<MonthlyStats[]>> => {
    const endpoint = year ? `/dashboard/monthly-stats?year=${year}` : '/dashboard/monthly-stats';
    return apiCall<MonthlyStats[]>(endpoint);
  },

  getMembershipDistribution: async (): Promise<ApiResponse<{ type: string; count: number }[]>> => {
    return apiCall<{ type: string; count: number }[]>('/dashboard/membership-distribution');
  },

  getGenderDistribution: async (): Promise<ApiResponse<{ gender: string; count: number }[]>> => {
    return apiCall<{ gender: string; count: number }[]>('/dashboard/gender-distribution');
  },

  getAgeDistribution: async (): Promise<ApiResponse<{ range: string; count: number }[]>> => {
    return apiCall<{ range: string; count: number }[]>('/dashboard/age-distribution');
  },

  getRecentActivities: async (limit?: number): Promise<ApiResponse<any[]>> => {
    const endpoint = limit ? `/dashboard/recent-activities?limit=${limit}` : '/dashboard/recent-activities';
    return apiCall<any[]>(endpoint);
  },
};

// Payments API
export const paymentsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    memberId?: string;
    status?: string;
    paymentType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<any>>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/payments?${queryString}` : '/payments';
    
    return apiCall<PaginatedResponse<any>>(endpoint);
  },

  getById: async (id: string): Promise<ApiResponse<{ payment: any }>> => {
    return apiCall<{ payment: any }>(`/payments/${id}`);
  },

  create: async (paymentData: any): Promise<ApiResponse<{ payment: any }>> => {
    return apiCall<{ payment: any }>('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  update: async (id: string, paymentData: any): Promise<ApiResponse<{ payment: any }>> => {
    return apiCall<{ payment: any }>(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    });
  },

  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>(`/payments/${id}`, {
      method: 'DELETE',
    });
  },

  markAsPaid: async (id: string, data?: { amount?: number; notes?: string }): Promise<ApiResponse<{ payment: any }>> => {
    return apiCall<{ payment: any }>(`/payments/${id}/mark-paid`, {
      method: 'PATCH',
      body: JSON.stringify(data || {}),
    });
  },

  getStats: async (): Promise<ApiResponse<{
    totalPayments: number;
    pendingPayments: number;
    overduePayments: number;
    totalRevenue: number;
    monthlyRevenue: number;
    paymentTypeDistribution: { type: string; count: number }[];
  }>> => {
    return apiCall<{
      totalPayments: number;
      pendingPayments: number;
      overduePayments: number;
      totalRevenue: number;
      monthlyRevenue: number;
      paymentTypeDistribution: { type: string; count: number }[];
    }>('/payments/stats/overview');
  },
};

// Workouts API
export const workoutsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    memberId?: string;
    workoutType?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<any>>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/workouts?${queryString}` : '/workouts';
    
    return apiCall<PaginatedResponse<any>>(endpoint);
  },

  getById: async (id: string): Promise<ApiResponse<{ workout: any }>> => {
    return apiCall<{ workout: any }>(`/workouts/${id}`);
  },

  create: async (workoutData: any): Promise<ApiResponse<{ workout: any }>> => {
    return apiCall<{ workout: any }>('/workouts', {
      method: 'POST',
      body: JSON.stringify(workoutData),
    });
  },

  update: async (id: string, workoutData: any): Promise<ApiResponse<{ workout: any }>> => {
    return apiCall<{ workout: any }>(`/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workoutData),
    });
  },

  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiCall<{ message: string }>(`/workouts/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async (): Promise<ApiResponse<{
    totalWorkouts: number;
    todayWorkouts: number;
    weeklyWorkouts: number;
    monthlyWorkouts: number;
    totalDuration: number;
    totalCalories: number;
    averageDuration: number;
    workoutTypeDistribution: { type: string; count: number }[];
  }>> => {
    return apiCall<{
      totalWorkouts: number;
      todayWorkouts: number;
      weeklyWorkouts: number;
      monthlyWorkouts: number;
      totalDuration: number;
      totalCalories: number;
      averageDuration: number;
      workoutTypeDistribution: { type: string; count: number }[];
    }>('/workouts/stats/overview');
  },

  getMemberHistory: async (memberId: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    workouts: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    stats: {
      totalWorkouts: number;
      totalDuration: number;
      totalCalories: number;
    };
  }>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/workouts/member/${memberId}/history?${queryString}` : `/workouts/member/${memberId}/history`;
    
    return apiCall<{
      workouts: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
      stats: {
        totalWorkouts: number;
        totalDuration: number;
        totalCalories: number;
      };
    }>(endpoint);
  },
};

// Auth token management
export const tokenManager = {
  setToken: (token: string) => {
    localStorage.setItem('authToken', token);
  },

  getToken: () => {
    return localStorage.getItem('authToken');
  },

  removeToken: () => {
    localStorage.removeItem('authToken');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

export default {
  auth: authAPI,
  members: membersAPI,
  dashboard: dashboardAPI,
  payments: paymentsAPI,
  workouts: workoutsAPI,
  tokenManager,
};


