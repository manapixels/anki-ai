export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      ai_generations: {
        Row: {
          id: string;
          user_id: string;
          generation_type: Database['public']['Enums']['generation_type'];
          original_content: string;
          generated_content: Json;
          context: Json;
          model_used: string;
          tokens_used: number;
          generation_time: number;
          confidence_score: number | null;
          cards_created: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          generation_type: Database['public']['Enums']['generation_type'];
          original_content: string;
          generated_content: Json;
          context?: Json;
          model_used?: string;
          tokens_used?: number;
          generation_time?: number;
          confidence_score?: number | null;
          cards_created?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          generation_type?: Database['public']['Enums']['generation_type'];
          original_content?: string;
          generated_content?: Json;
          context?: Json;
          model_used?: string;
          tokens_used?: number;
          generation_time?: number;
          confidence_score?: number | null;
          cards_created?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_generations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      card_reviews: {
        Row: {
          id: string;
          card_id: string;
          user_id: string;
          ease_factor: number;
          interval: number;
          repetitions: number;
          next_review: string;
          card_state: Database['public']['Enums']['card_state'];
          last_quality: Database['public']['Enums']['review_quality'] | null;
          total_reviews: number;
          correct_reviews: number;
          streak: number;
          best_streak: number;
          average_response_time: number;
          last_reviewed: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          card_id: string;
          user_id: string;
          ease_factor?: number;
          interval?: number;
          repetitions?: number;
          next_review: string;
          card_state?: Database['public']['Enums']['card_state'];
          last_quality?: Database['public']['Enums']['review_quality'] | null;
          total_reviews?: number;
          correct_reviews?: number;
          streak?: number;
          best_streak?: number;
          average_response_time?: number;
          last_reviewed?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          card_id?: string;
          user_id?: string;
          ease_factor?: number;
          interval?: number;
          repetitions?: number;
          next_review?: string;
          card_state?: Database['public']['Enums']['card_state'];
          last_quality?: Database['public']['Enums']['review_quality'] | null;
          total_reviews?: number;
          correct_reviews?: number;
          streak?: number;
          best_streak?: number;
          average_response_time?: number;
          last_reviewed?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'card_reviews_card_id_fkey';
            columns: ['card_id'];
            isOneToOne: false;
            referencedRelation: 'cards';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'card_reviews_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      cards: {
        Row: {
          id: string;
          deck_id: string;
          front_text: string;
          back_text: string;
          card_type: Database['public']['Enums']['card_type'];
          notes: string | null;
          examples: string[] | null;
          pronunciation: string | null;
          audio_url: string | null;
          image_url: string | null;
          tags: string[] | null;
          difficulty_level: Database['public']['Enums']['difficulty_level'];
          language: string | null;
          etymology: string | null;
          part_of_speech: string | null;
          is_ai_generated: boolean;
          generation_source: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          deck_id: string;
          front_text: string;
          back_text: string;
          card_type?: Database['public']['Enums']['card_type'];
          notes?: string | null;
          examples?: string[] | null;
          pronunciation?: string | null;
          audio_url?: string | null;
          image_url?: string | null;
          tags?: string[] | null;
          difficulty_level?: Database['public']['Enums']['difficulty_level'];
          language?: string | null;
          etymology?: string | null;
          part_of_speech?: string | null;
          is_ai_generated?: boolean;
          generation_source?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          deck_id?: string;
          front_text?: string;
          back_text?: string;
          card_type?: Database['public']['Enums']['card_type'];
          notes?: string | null;
          examples?: string[] | null;
          pronunciation?: string | null;
          audio_url?: string | null;
          image_url?: string | null;
          tags?: string[] | null;
          difficulty_level?: Database['public']['Enums']['difficulty_level'];
          language?: string | null;
          etymology?: string | null;
          part_of_speech?: string | null;
          is_ai_generated?: boolean;
          generation_source?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: 'cards_deck_id_fkey';
            columns: ['deck_id'];
            isOneToOne: false;
            referencedRelation: 'decks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cards_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      deck_ratings: {
        Row: {
          id: string;
          deck_id: string;
          user_id: string;
          rating: number;
          review_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          deck_id: string;
          user_id: string;
          rating: number;
          review_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          deck_id?: string;
          user_id?: string;
          rating?: number;
          review_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'deck_ratings_deck_id_fkey';
            columns: ['deck_id'];
            isOneToOne: false;
            referencedRelation: 'decks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'deck_ratings_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      decks: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          slug: string;
          category: Database['public']['Enums']['deck_category'];
          difficulty_level: Database['public']['Enums']['difficulty_level'];
          tags: string[] | null;
          is_public: boolean;
          is_featured: boolean;
          language: string | null;
          target_language: string | null;
          estimated_study_time: number;
          card_count: number;
          download_count: number;
          study_count: number;
          average_rating: number;
          created_by: string;
          created_at: string;
          updated_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          slug: string;
          category?: Database['public']['Enums']['deck_category'];
          difficulty_level?: Database['public']['Enums']['difficulty_level'];
          tags?: string[] | null;
          is_public?: boolean;
          is_featured?: boolean;
          language?: string | null;
          target_language?: string | null;
          estimated_study_time?: number;
          card_count?: number;
          download_count?: number;
          study_count?: number;
          average_rating?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          slug?: string;
          category?: Database['public']['Enums']['deck_category'];
          difficulty_level?: Database['public']['Enums']['difficulty_level'];
          tags?: string[] | null;
          is_public?: boolean;
          is_featured?: boolean;
          language?: string | null;
          target_language?: string | null;
          estimated_study_time?: number;
          card_count?: number;
          download_count?: number;
          study_count?: number;
          average_rating?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: 'decks_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          avatar_url: string | null;
          username: string;
          preferred_unit_system: Database['public']['Enums']['unit_system'] | null;
          timezone: string | null;
          daily_study_goal: number;
          max_new_cards: number;
          max_review_cards: number;
          preferred_study_time: string | null;
          ai_difficulty_adjustment: boolean;
          ai_content_generation: boolean;
          preferred_languages: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          avatar_url?: string | null;
          username: string;
          preferred_unit_system?: Database['public']['Enums']['unit_system'] | null;
          timezone?: string | null;
          daily_study_goal?: number;
          max_new_cards?: number;
          max_review_cards?: number;
          preferred_study_time?: string | null;
          ai_difficulty_adjustment?: boolean;
          ai_content_generation?: boolean;
          preferred_languages?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar_url?: string | null;
          username?: string;
          preferred_unit_system?: Database['public']['Enums']['unit_system'] | null;
          timezone?: string | null;
          daily_study_goal?: number;
          max_new_cards?: number;
          max_review_cards?: number;
          preferred_study_time?: string | null;
          ai_difficulty_adjustment?: boolean;
          ai_content_generation?: boolean;
          preferred_languages?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          deck_id: string;
          session_type: Database['public']['Enums']['session_type'];
          start_time: string;
          end_time: string | null;
          cards_studied: number;
          new_cards: number;
          review_cards: number;
          relearning_cards: number;
          correct_answers: number;
          total_time: number;
          average_response_time: number;
          session_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          deck_id: string;
          session_type: Database['public']['Enums']['session_type'];
          start_time: string;
          end_time?: string | null;
          cards_studied?: number;
          new_cards?: number;
          review_cards?: number;
          relearning_cards?: number;
          correct_answers?: number;
          total_time?: number;
          average_response_time?: number;
          session_data?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          deck_id?: string;
          session_type?: Database['public']['Enums']['session_type'];
          start_time?: string;
          end_time?: string | null;
          cards_studied?: number;
          new_cards?: number;
          review_cards?: number;
          relearning_cards?: number;
          correct_answers?: number;
          total_time?: number;
          average_response_time?: number;
          session_data?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'study_sessions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'study_sessions_deck_id_fkey';
            columns: ['deck_id'];
            isOneToOne: false;
            referencedRelation: 'decks';
            referencedColumns: ['id'];
          }
        ];
      };
      user_favorite_decks: {
        Row: {
          user_id: string;
          deck_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          deck_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          deck_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_favorite_decks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_favorite_decks_deck_id_fkey';
            columns: ['deck_id'];
            isOneToOne: false;
            referencedRelation: 'decks';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      decks_with_stats: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          slug: string;
          category: Database['public']['Enums']['deck_category'];
          difficulty_level: Database['public']['Enums']['difficulty_level'];
          tags: string[] | null;
          is_public: boolean;
          is_featured: boolean;
          language: string | null;
          target_language: string | null;
          estimated_study_time: number;
          card_count: number;
          download_count: number;
          study_count: number;
          average_rating: number;
          created_by: string;
          created_at: string;
          updated_at: string;
          metadata: Json;
          created_by_profile: Json;
          rating_count: number;
          favorite_count: number;
        };
        Relationships: [];
      };
      due_cards: {
        Row: {
          id: string;
          deck_id: string;
          front_text: string;
          back_text: string;
          card_type: Database['public']['Enums']['card_type'];
          notes: string | null;
          examples: string[] | null;
          pronunciation: string | null;
          audio_url: string | null;
          image_url: string | null;
          tags: string[] | null;
          difficulty_level: Database['public']['Enums']['difficulty_level'];
          language: string | null;
          etymology: string | null;
          part_of_speech: string | null;
          is_ai_generated: boolean;
          generation_source: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          metadata: Json;
          user_id: string;
          card_state: Database['public']['Enums']['card_state'];
          next_review: string;
          ease_factor: number;
          interval: number;
          deck_name: string;
        };
        Relationships: [];
      };
      user_study_progress: {
        Row: {
          user_id: string;
          deck_id: string;
          deck_name: string;
          total_cards: number;
          new_cards: number;
          learning_cards: number;
          review_cards: number;
          mastered_cards: number;
          average_ease: number;
          mastery_percentage: number;
          last_studied: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      calculate_next_review: {
        Args: {
          current_ease: number;
          current_interval: number;
          quality: number;
        };
        Returns: {
          new_ease: number;
          new_interval: number;
          next_review: string;
        }[];
      };
      slugify: {
        Args: {
          value: string;
        };
        Returns: string;
      };
    };
    Enums: {
      app_permission: 'events.create' | 'events.delete';
      card_state: 'new' | 'learning' | 'review' | 'relearning' | 'mastered';
      card_type: 'basic' | 'cloze' | 'image_occlusion' | 'audio' | 'reverse';
      deck_category: 
        | 'vocabulary' 
        | 'grammar' 
        | 'phrases' 
        | 'idioms' 
        | 'academic' 
        | 'business' 
        | 'casual' 
        | 'technical' 
        | 'other';
      difficulty_level: '1' | '2' | '3' | '4' | '5';
      generation_type: 
        | 'contextual_variations' 
        | 'difficulty_adjustment' 
        | 'pronunciation_guide'
        | 'example_generation' 
        | 'mnemonic_creation' 
        | 'translation_variants'
        | 'grammar_explanations' 
        | 'usage_examples';
      review_quality: 'again' | 'hard' | 'good' | 'easy' | 'perfect';
      session_type: 'new' | 'review' | 'mixed' | 'cram' | 'practice';
      unit_system: 'metric' | 'imperial';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};