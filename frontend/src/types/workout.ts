export type WorkoutType = 'CARDIO' | 'STRENGTH' | 'FLEXIBILITY' | 'SPORTS' | 'OTHER';

export interface Workout {
  id: string;
  memberId: string;
  workoutType: WorkoutType;
  duration: number;
  calories?: number;
  notes?: string;
  workoutAt: string;
  createdAt: string;
  updatedAt: string;
  member?: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
}

export interface WorkoutTypeDistribution {
  type: string;
  count: number;
}

export interface WorkoutStats {
  totalWorkouts: number;
  todayWorkouts: number;
  weeklyWorkouts: number;
  monthlyWorkouts: number;
  totalDuration: number;
  totalCalories: number;
  averageDuration: number;
  workoutTypeDistribution: WorkoutTypeDistribution[];
}

export interface MemberWorkoutHistory {
  workouts: Workout[];
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
}

export interface GetWorkoutsParams {
  page?: number;
  limit?: number;
  memberId?: string;
  workoutType?: WorkoutType;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
