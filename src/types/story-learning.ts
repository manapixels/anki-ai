export interface StoryLearningSession {
  id: string;
  user_id: string;
  session_date: string;
  target_words: TargetWord[];
  story_content: GeneratedStory;
  news_sources: NewsSource[];
  user_interactions: UserInteraction[];
  performance_metrics: StoryPerformanceMetrics;
  created_at: string;
}

export interface TargetWord {
  word: string;
  definition: string;
  difficulty_level: number;
  last_seen: string;
  mastery_score: number;
  context_examples: string[];
  part_of_speech: string;
  frequency_rank: number; // how common the word is
  user_struggle_areas: string[]; // grammar, pronunciation, usage, etc.
}

export interface GeneratedStory {
  title: string;
  content: string;
  story_type: StoryType;
  complexity_level: number;
  word_integration_points: WordIntegrationPoint[];
  news_elements: NewsElement[];
  cultural_context: CulturalContext;
  estimated_reading_time: number;
  comprehension_questions?: ComprehensionQuestion[];
}

export interface NewsElement {
  headline: string;
  source: string;
  category: NewsCategory;
  relevance_score: number;
  integrated_words: string[];
  context_adaptation: string; // How the news was adapted for the story
  publish_date: string;
}

export interface WordIntegrationPoint {
  word: string;
  position: number; // character position in story
  integration_type: IntegrationType;
  context_strength: number; // how naturally it fits (1-10)
  learning_emphasis: EmphasisType;
  alternative_forms?: string[]; // different conjugations, forms
}

export type StoryType = 
  | 'news_adaptation' // Based on real news
  | 'scenario_simulation' // Real-world situation
  | 'narrative_adventure' // Story-driven
  | 'dialogue_conversation' // Conversation format
  | 'documentary_style' // Educational/informative
  | 'personal_journal' // First-person perspective;

export type IntegrationType = 
  | 'natural_flow' // Word appears naturally in context
  | 'definition_embedded' // Definition woven into narrative
  | 'contrast_comparison' // Compared with known words
  | 'repetition_reinforcement' // Multiple uses in different contexts
  | 'cultural_explanation'; // Cultural usage explanation

export type EmphasisType = 
  | 'subtle' // Word used naturally without emphasis
  | 'highlighted' // Word emphasized for learning
  | 'interactive' // User must interact with word
  | 'quiz_integrated'; // Comprehension check embedded

export type NewsCategory = 
  | 'world_news'
  | 'technology' 
  | 'science'
  | 'business'
  | 'culture'
  | 'sports'
  | 'health'
  | 'environment'
  | 'politics'
  | 'entertainment';

export interface NewsSource {
  id: string;
  headline: string;
  summary: string;
  category: NewsCategory;
  source_name: string;
  publish_date: string;
  relevance_to_words: number;
  language_level: number;
  url?: string;
  extracted_vocabulary: string[];
}

export interface CulturalContext {
  country_focus?: string;
  cultural_elements: string[];
  idiomatic_expressions: string[];
  social_context: string;
  historical_references?: string[];
}

export interface UserInteraction {
  word: string;
  interaction_type: InteractionType;
  timestamp: string;
  user_response?: string;
  correctness_score?: number;
  time_taken: number; // milliseconds
}

export type InteractionType = 
  | 'word_click' // User clicked on word for definition
  | 'comprehension_answer' // Answered comprehension question
  | 'word_usage_attempt' // Tried to use word in context
  | 'pronunciation_attempt' // Audio pronunciation attempt
  | 'context_question' // Asked about word context
  | 'story_completion'; // Completed reading story

export interface StoryPerformanceMetrics {
  reading_time: number;
  comprehension_score: number;
  word_retention_immediate: number; // % words understood during session
  engagement_score: number; // based on interactions
  difficulty_appropriateness: number; // was story too easy/hard
  news_relevance_rating?: number; // user feedback on news integration
}

export interface ComprehensionQuestion {
  question: string;
  question_type: QuestionType;
  target_words: string[];
  correct_answer?: string;
  multiple_choice_options?: string[];
  explanation: string;
  difficulty_level: number;
}

export type QuestionType = 
  | 'word_meaning' // What does X mean in this context?
  | 'story_comprehension' // What happened in the story?
  | 'word_usage' // How would you use X in a sentence?
  | 'context_inference' // What can you infer from...?
  | 'cultural_understanding' // What cultural element is shown?
  | 'news_connection'; // How does this relate to current events?

// AI Story Generation Request
export interface StoryGenerationRequest {
  user_id: string;
  target_words: TargetWord[];
  user_preferences: UserLearningPreferences;
  news_integration: NewsIntegrationSettings;
  session_constraints: SessionConstraints;
}

export interface UserLearningPreferences {
  interests: string[];
  preferred_story_types: StoryType[];
  cultural_background: string;
  target_culture?: string;
  reading_level: number;
  attention_span: 'short' | 'medium' | 'long';
  learning_goals: string[];
  avoided_topics?: string[];
}

export interface NewsIntegrationSettings {
  include_news: boolean;
  preferred_categories: NewsCategory[];
  news_recency: 'today' | 'this_week' | 'this_month';
  local_news_preference?: string; // country/region
  news_complexity_level: number;
  max_news_elements: number;
}

export interface SessionConstraints {
  max_words_per_session: number;
  target_reading_time: number; // minutes
  include_comprehension_questions: boolean;
  difficulty_adjustment: 'conservative' | 'moderate' | 'aggressive';
  cultural_sensitivity_level: 'high' | 'medium' | 'low';
}