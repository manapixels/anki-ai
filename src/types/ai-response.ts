export interface AIGenerationRequest {
  type: GenerationType;
  context: {
    original_text: string;
    target_language?: string;
    difficulty_level: number;
    user_proficiency?: string;
    additional_context?: string;
  };
  options: {
    count: number;
    include_pronunciation?: boolean;
    include_examples?: boolean;
    format_preference?: 'simple' | 'detailed';
  };
}

export interface AIGenerationResponse {
  id: string;
  request_id: string;
  generated_content: GeneratedContent[];
  metadata: {
    model_used: string;
    generation_time: number;
    tokens_used: number;
    confidence_score: number;
  };
  created_at: string;
}

export interface GeneratedContent {
  front_text: string;
  back_text: string;
  explanation?: string;
  pronunciation?: string;
  examples?: string[];
  difficulty_score: number;
  tags: string[];
}

export type GenerationType = 
  | 'contextual_variations'
  | 'difficulty_adjustment'
  | 'pronunciation_guide'
  | 'example_generation'
  | 'mnemonic_creation'
  | 'translation_variants'
  | 'grammar_explanations'
  | 'usage_examples';

export interface AIAnalysisRequest {
  user_id: string;
  analysis_type: AnalysisType;
  data: {
    study_history: any[];
    performance_metrics: any[];
    time_period: string;
  };
}

export interface AIAnalysisResponse {
  insights: {
    learning_patterns: string[];
    strengths: string[];
    areas_for_improvement: string[];
    retention_analysis: string;
  };
  recommendations: {
    study_schedule: string;
    focus_areas: string[];
    difficulty_adjustments: Record<string, number>;
    review_strategy: string;
  };
  predictions: {
    mastery_timeline: Record<string, string>;
    success_probability: Record<string, number>;
    optimal_review_intervals: Record<string, number>;
  };
}

export type AnalysisType = 
  | 'performance_analysis'
  | 'learning_pattern_detection'
  | 'retention_prediction'
  | 'difficulty_optimization'
  | 'schedule_optimization';

export interface AIPromptTemplate {
  id: string;
  name: string;
  category: GenerationType;
  template: string;
  variables: string[];
  description: string;
  examples: string[];
}