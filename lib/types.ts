export interface User {
  id: string;
  telegram_id: number;
  full_name: string;
  goal: string | null;
  level: 'beginner' | 'intermediate' | 'advanced' | null;
  daily_time: number | null;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  total_sessions?: number;
}

export interface Progress {
  id: string;
  user_id: string;
  topic: string;
  evaluation: string | null;
  mistakes: string[] | null;
  timestamp: string;
}

export interface OnboardingState {
  step: number;
  full_name: string;
  goal: string;
  level: string;
  daily_time: string;
  user_id?: string;
}

export type ChatMessage = {
  role: 'ai' | 'user';
  text: string;
};
