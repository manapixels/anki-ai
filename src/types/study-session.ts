export interface StudySession {
  id: string;
  user_id: string;
  deck_id: string;
  session_type: SessionType;
  start_time: string;
  end_time?: string;
  cards_studied: number;
  new_cards: number;
  review_cards: number;
  correct_answers: number;
  total_time: number; // in seconds
  average_response_time: number; // in seconds
}

export interface StudySessionSummary {
  session: StudySession;
  performance_metrics: {
    accuracy: number;
    speed: number;
    retention_improvement: number;
    difficulty_distribution: Record<string, number>;
  };
  recommendations: string[];
}

export type SessionType = 'new' | 'review' | 'mixed' | 'cram' | 'practice';

export interface StudyProgress {
  user_id: string;
  deck_id: string;
  total_cards: number;
  cards_mastered: number;
  study_streak: number;
  last_studied: string;
  estimated_completion: string;
  mastery_percentage: number;
}

export interface LearningAnalytics {
  user_id: string;
  period: 'daily' | 'weekly' | 'monthly';
  cards_studied: number;
  time_spent: number;
  accuracy_rate: number;
  retention_rate: number;
  streak_count: number;
  weak_areas: string[];
  strong_areas: string[];
  recommendations: AIRecommendation[];
}

export interface AIRecommendation {
  type: 'schedule' | 'focus_area' | 'difficulty' | 'review_strategy';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimated_impact: number; // 1-10 scale
}