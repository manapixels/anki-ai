export interface Card {
  id: string;
  deck_id: string;
  front_text: string;
  back_text: string;
  card_type: CardType;
  difficulty_level: DifficultyLevel;
  tags: string[];
  media_url?: string;
  audio_url?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CardReview {
  id: string;
  card_id: string;
  user_id: string;
  quality: ReviewQuality;
  ease_factor: number;
  interval: number;
  next_review: string;
  review_count: number;
  created_at: string;
}

export type CardType = 'basic' | 'cloze' | 'image_occlusion' | 'audio' | 'reverse';

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export type ReviewQuality = 1 | 2 | 3 | 4 | 5; // 1=again, 2=hard, 3=good, 4=easy, 5=perfect

export type CardState = 'new' | 'learning' | 'review' | 'relearning' | 'mastered';

export interface CardWithReview extends Card {
  review?: CardReview;
  state: CardState;
  due_date?: string;
}