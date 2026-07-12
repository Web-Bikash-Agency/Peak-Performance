export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRING_SOON' | 'ARCHIVED';
export type MembershipType = 'ONE_MONTH' | 'THREE_MONTH' | 'SIX_MONTH' | 'ONE_YEAR';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Member {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  membershipType: MembershipType;
  expiryDate: Date;
  status: MemberStatus;
  profilePicture?: string;
  joinDate: Date;
}

export interface MemberCounts {
  total: number;
  active: number;
  inactive: number;
  expiringSoon: number;
  archived?: number;
}

export interface MemberStats {
  checkInCount: number;
  paymentCount: number;
  totalPaid: number;
  workoutCount: number;
  totalWorkoutDuration: number;
  totalCalories: number;
}

export interface GetMembersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: MemberStatus;
  membershipType?: MembershipType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
