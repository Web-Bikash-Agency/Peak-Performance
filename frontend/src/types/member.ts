export interface Member {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  membershipType: 'ONE_MONTH' | 'THREE_MONTH' | 'SIX_MONTH' | 'ONE_YEAR';
  expiryDate: Date;
  status: 'Active' | 'Inactive' | 'Expiring Soon' | 'Archived';
  profilePicture?: string;
  joinDate: Date;
}

export interface MonthlyStats {
  month: string;
  newMembers: number;
  year: number;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  expiringSoon: number;
}