import { Card } from './card';

export interface Deck {
  id: string;
  name: string;
  description?: string;
  category: DeckCategory;
  difficulty_level: DifficultyLevel;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  card_count: number;
  study_count: number;
}

export interface DeckWithCards extends Deck {
  cards: Card[];
}

export interface DeckStats {
  deck_id: string;
  total_cards: number;
  new_cards: number;
  learning_cards: number;
  review_cards: number;
  mastered_cards: number;
  average_ease: number;
  retention_rate: number;
  study_streak: number;
  last_studied: string | null;
}

export type DeckCategory = 
  | 'vocabulary' 
  | 'grammar' 
  | 'phrases' 
  | 'idioms' 
  | 'academic' 
  | 'business' 
  | 'casual' 
  | 'technical' 
  | 'other';

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface DeckSharing {
  id: string;
  deck_id: string;
  shared_by: string;
  is_featured: boolean;
  download_count: number;
  rating: number;
  created_at: string;
}