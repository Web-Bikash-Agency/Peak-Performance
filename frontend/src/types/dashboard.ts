export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  expiringSoon: number;
}

export interface DashboardOverviewStats extends DashboardStats {
  todayCheckIns: number;
  monthlyRevenue: number;
  newMembersThisMonth: number;
}

export interface MonthlyStats {
  month: string;
  monthNumber: number;
  newMembers: number;
  revenue: number;
  checkIns: number;
  year: number;
}

export interface DashboardAvailableYears {
  memberYears: number[];
  revenueYears: number[];
}

export interface MembershipDistribution {
  type: string;
  count: number;
}

export interface GenderDistribution {
  gender: string;
  count: number;
}

export interface AgeDistribution {
  range: string;
  count: number;
}

export interface RecentActivity {
  type: 'CHECK_IN' | 'PAYMENT' | 'WORKOUT';
  timestamp: string;
  member: {
    id: string;
    name: string;
    profilePicture?: string;
  };
  data: Record<string, unknown>;
}
