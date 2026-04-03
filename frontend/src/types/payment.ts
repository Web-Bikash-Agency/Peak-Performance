export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type PaymentType = 'MEMBERSHIP' | 'PERSONAL_TRAINING' | 'CLASS' | 'OTHER';

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  paymentType: PaymentType;
  status: PaymentStatus;
  dueDate: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  member?: {
    id: string;
    name: string;
    profilePicture?: string;
  };
}

export interface PaymentTypeDistribution {
  type: string;
  count: number;
}

export interface PaymentStats {
  totalPayments: number;
  pendingPayments: number;
  overduePayments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  paymentTypeDistribution: PaymentTypeDistribution[];
}

export interface GetPaymentsParams {
  page?: number;
  limit?: number;
  memberId?: string;
  status?: PaymentStatus;
  paymentType?: PaymentType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
