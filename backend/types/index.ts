export interface Badge {
  id: string;
  name: string;
  description: string;
  color: string;
  model_url: string;
  target_index: number;
  created_at?: string;
}

export interface UserBadge {
  id?: string;
  user_id: string;
  badge_id: string;
  acquired_at: string;
}

export interface BadgeServiceResponse<T> {
  data: T | null;
  error: Error | null;
}
