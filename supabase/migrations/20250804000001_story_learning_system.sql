-- Story Learning System Migration
-- Extends the Anki AI schema to support adaptive story weaving and news integration

-- ============================================================================
-- STORY LEARNING ENUMS
-- ============================================================================

CREATE TYPE public.story_type AS ENUM(
  'news_adaptation', 'scenario_simulation', 'narrative_adventure', 
  'dialogue_conversation', 'documentary_style', 'personal_journal'
);

CREATE TYPE public.integration_type AS ENUM(
  'natural_flow', 'definition_embedded', 'contrast_comparison', 
  'repetition_reinforcement', 'cultural_explanation'
);

CREATE TYPE public.emphasis_type AS ENUM(
  'subtle', 'highlighted', 'interactive', 'quiz_integrated'
);

CREATE TYPE public.news_category AS ENUM(
  'world_news', 'technology', 'science', 'business', 'culture', 
  'sports', 'health', 'environment', 'politics', 'entertainment'
);

CREATE TYPE public.interaction_type AS ENUM(
  'word_click', 'comprehension_answer', 'word_usage_attempt', 
  'pronunciation_attempt', 'context_question', 'story_completion'
);

CREATE TYPE public.question_type AS ENUM(
  'word_meaning', 'story_comprehension', 'word_usage', 
  'context_inference', 'cultural_understanding', 'news_connection'
);

-- ============================================================================
-- ENHANCED VOCABULARY TRACKING
-- ============================================================================

-- Words table (enhanced from cards)
CREATE TABLE public.words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  part_of_speech TEXT,
  pronunciation TEXT,
  etymology TEXT,
  
  -- Frequency and difficulty
  frequency_rank INTEGER, -- how common the word is (1 = most common)
  base_difficulty_level difficulty_level DEFAULT '1',
  
  -- Multi-language support
  language TEXT DEFAULT 'en',
  translations JSONB DEFAULT '{}'::jsonb,
  
  -- Context and usage
  common_contexts TEXT[] DEFAULT '{}',
  example_sentences TEXT[] DEFAULT '{}',
  collocations TEXT[] DEFAULT '{}', -- words commonly used together
  
  -- Cultural and semantic information
  cultural_notes TEXT,
  semantic_field TEXT, -- business, academic, casual, etc.
  register_level TEXT, -- formal, informal, slang, etc.
  
  -- Media
  audio_url TEXT,
  image_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  metadata JSONB DEFAULT '{}'::jsonb
);

-- User word progress (replaces card_reviews but focused on words)
CREATE TABLE public.user_word_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,
  
  -- Spaced repetition data
  ease_factor DECIMAL(4,2) DEFAULT 2.50,
  interval INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Learning state
  mastery_score DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 1.00
  word_state card_state DEFAULT 'new',
  last_quality review_quality,
  
  -- Context-specific tracking
  context_encounters JSONB DEFAULT '{}'::jsonb, -- different contexts where word was seen
  usage_attempts INTEGER DEFAULT 0,
  successful_usage INTEGER DEFAULT 0,
  struggle_areas TEXT[] DEFAULT '{}', -- pronunciation, grammar, usage, etc.
  
  -- Performance metrics
  total_exposures INTEGER DEFAULT 0,
  correct_responses INTEGER DEFAULT 0,
  average_response_time INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  
  -- Timestamps
  first_encountered TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT unique_user_word UNIQUE (user_id, word_id)
);

-- ============================================================================
-- NEWS INTEGRATION SYSTEM
-- ============================================================================

-- News articles cache
CREATE TABLE public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  headline TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT,
  
  -- Source information
  source_name TEXT NOT NULL,
  source_url TEXT,
  author TEXT,
  
  -- Categorization
  category news_category NOT NULL,
  language TEXT DEFAULT 'en',
  country_focus TEXT,
  
  -- Content analysis
  complexity_level INTEGER DEFAULT 1, -- 1-5 difficulty
  extracted_vocabulary TEXT[] DEFAULT '{}',
  key_topics TEXT[] DEFAULT '{}',
  sentiment_score DECIMAL(3,2), -- -1.00 to 1.00
  
  -- Timestamps
  publish_date TIMESTAMP WITH TIME ZONE NOT NULL,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Indexes for performance
  CONSTRAINT news_articles_source_url_key UNIQUE (source_url)
);

-- ============================================================================
-- STORY LEARNING SESSIONS
-- ============================================================================

-- Main story learning sessions
CREATE TABLE public.story_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Session planning
  target_words UUID[] NOT NULL, -- array of word IDs
  session_goals TEXT[] DEFAULT '{}',
  
  -- Generated story
  story_title TEXT NOT NULL,
  story_content TEXT NOT NULL,
  story_type story_type NOT NULL,
  complexity_level INTEGER DEFAULT 1,
  estimated_reading_time INTEGER, -- minutes
  
  -- News integration
  integrated_news_articles UUID[] DEFAULT '{}', -- references to news_articles
  news_adaptation_notes TEXT,
  
  -- Cultural context
  cultural_context JSONB DEFAULT '{}'::jsonb,
  target_culture TEXT,
  
  -- Performance tracking
  actual_reading_time INTEGER, -- seconds
  comprehension_score DECIMAL(3,2),
  engagement_score DECIMAL(3,2),
  difficulty_rating INTEGER, -- user feedback 1-5
  relevance_rating INTEGER, -- user feedback 1-5
  
  -- Session state
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  completion_percentage INTEGER DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Additional data
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Word integration points within stories
CREATE TABLE public.story_word_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_session_id UUID NOT NULL REFERENCES public.story_sessions(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,
  
  -- Integration details
  position_in_story INTEGER NOT NULL, -- character position
  integration_type integration_type NOT NULL,
  emphasis_type emphasis_type NOT NULL,
  context_strength INTEGER DEFAULT 5, -- 1-10 how naturally it fits
  
  -- Alternative forms used
  word_form_used TEXT, -- actual form used in story (conjugation, etc.)
  alternative_forms TEXT[] DEFAULT '{}',
  
  -- Learning data
  definition_provided BOOLEAN DEFAULT false,
  cultural_explanation TEXT,
  context_clues TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User interactions with story elements
CREATE TABLE public.story_user_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_session_id UUID NOT NULL REFERENCES public.story_sessions(id) ON DELETE CASCADE,
  word_id UUID REFERENCES public.words(id) ON DELETE CASCADE,
  
  -- Interaction details
  interaction_type interaction_type NOT NULL,
  interaction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- User response
  user_response TEXT,
  correctness_score DECIMAL(3,2), -- 0.00 to 1.00
  time_taken INTEGER, -- milliseconds
  
  -- Context
  story_position INTEGER, -- where in story this happened
  additional_context JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comprehension questions and answers
CREATE TABLE public.story_comprehension_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_session_id UUID NOT NULL REFERENCES public.story_sessions(id) ON DELETE CASCADE,
  
  -- Question details
  question TEXT NOT NULL,
  question_type question_type NOT NULL,
  target_words UUID[] DEFAULT '{}', -- words this question tests
  
  -- Answer options
  correct_answer TEXT,
  multiple_choice_options TEXT[] DEFAULT '{}',
  explanation TEXT,
  
  -- Metadata
  difficulty_level INTEGER DEFAULT 1,
  points_value INTEGER DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User answers to comprehension questions
CREATE TABLE public.story_question_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.story_comprehension_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Response data
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  points_earned INTEGER DEFAULT 0,
  time_taken INTEGER, -- milliseconds
  
  -- Learning insights
  struggle_indicators TEXT[] DEFAULT '{}',
  confidence_level INTEGER, -- 1-5 user's confidence
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT unique_user_question_response UNIQUE (question_id, user_id)
);

-- ============================================================================
-- USER PREFERENCES FOR STORY LEARNING
-- ============================================================================

-- Extend profiles with story learning preferences
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS story_preferences JSONB DEFAULT '{
  "interests": [],
  "preferred_story_types": [],
  "cultural_background": "",
  "target_culture": "",
  "attention_span": "medium",
  "learning_goals": [],
  "avoided_topics": [],
  "news_integration": {
    "include_news": true,
    "preferred_categories": [],
    "news_recency": "this_week",
    "local_news_preference": "",
    "max_news_elements": 2
  }
}'::jsonb;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Words indexes
CREATE INDEX idx_words_language ON words(language);
CREATE INDEX idx_words_frequency ON words(frequency_rank);
CREATE INDEX idx_words_difficulty ON words(base_difficulty_level);
CREATE INDEX idx_words_semantic_field ON words(semantic_field);

-- User progress indexes
CREATE INDEX idx_user_word_progress_user ON user_word_progress(user_id);
CREATE INDEX idx_user_word_progress_word ON user_word_progress(word_id);
CREATE INDEX idx_user_word_progress_next_review ON user_word_progress(next_review);
CREATE INDEX idx_user_word_progress_state ON user_word_progress(word_state);
CREATE INDEX idx_user_word_progress_due ON user_word_progress(user_id, next_review) WHERE next_review <= now();

-- News indexes
CREATE INDEX idx_news_articles_category ON news_articles(category);
CREATE INDEX idx_news_articles_publish_date ON news_articles(publish_date);
CREATE INDEX idx_news_articles_language ON news_articles(language);
CREATE INDEX idx_news_articles_complexity ON news_articles(complexity_level);

-- Story session indexes
CREATE INDEX idx_story_sessions_user ON story_sessions(user_id);
CREATE INDEX idx_story_sessions_created_at ON story_sessions(created_at);
CREATE INDEX idx_story_sessions_status ON story_sessions(status);

-- Integration indexes
CREATE INDEX idx_story_word_integrations_session ON story_word_integrations(story_session_id);
CREATE INDEX idx_story_word_integrations_word ON story_word_integrations(word_id);

-- Interaction indexes
CREATE INDEX idx_story_interactions_session ON story_user_interactions(story_session_id);
CREATE INDEX idx_story_interactions_user ON story_user_interactions(story_session_id, interaction_timestamp);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Words are public (read-only for most users)
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Words are viewable by everyone" ON words FOR SELECT USING (true);
CREATE POLICY "Only admins can modify words" ON words FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND metadata->>'role' = 'admin')
);

-- User word progress
ALTER TABLE user_word_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own word progress" ON user_word_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own word progress" ON user_word_progress FOR ALL USING (auth.uid() = user_id);

-- News articles are public read
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "News articles are viewable by everyone" ON news_articles FOR SELECT USING (true);
CREATE POLICY "Only system can manage news" ON news_articles FOR ALL USING (false); -- managed by system only

-- Story sessions
ALTER TABLE story_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own story sessions" ON story_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own story sessions" ON story_sessions FOR ALL USING (auth.uid() = user_id);

-- Story integrations follow session permissions
ALTER TABLE story_word_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Story integrations follow session permissions" ON story_word_integrations FOR SELECT USING (
  EXISTS (SELECT 1 FROM story_sessions WHERE id = story_session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage story integrations for own sessions" ON story_word_integrations FOR ALL USING (
  EXISTS (SELECT 1 FROM story_sessions WHERE id = story_session_id AND user_id = auth.uid())
);

-- Similar policies for other story-related tables
ALTER TABLE story_user_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own story interactions" ON story_user_interactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM story_sessions WHERE id = story_session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage own story interactions" ON story_user_interactions FOR ALL USING (
  EXISTS (SELECT 1 FROM story_sessions WHERE id = story_session_id AND user_id = auth.uid())
);

ALTER TABLE story_comprehension_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view questions for their sessions" ON story_comprehension_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM story_sessions WHERE id = story_session_id AND user_id = auth.uid())
);

ALTER TABLE story_question_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own question responses" ON story_question_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own question responses" ON story_question_responses FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- Words due for review today
CREATE OR REPLACE VIEW words_due_today WITH (security_invoker=true) AS
SELECT 
  w.*,
  uwp.user_id,
  uwp.mastery_score,
  uwp.word_state,
  uwp.next_review,
  uwp.struggle_areas,
  uwp.context_encounters
FROM words w
JOIN user_word_progress uwp ON uwp.word_id = w.id
WHERE uwp.next_review <= now()
ORDER BY uwp.next_review ASC;

-- User learning analytics
CREATE OR REPLACE VIEW user_learning_analytics WITH (security_invoker=true) AS
SELECT 
  p.id as user_id,
  p.username,
  COUNT(DISTINCT uwp.word_id) as total_words,
  COUNT(DISTINCT CASE WHEN uwp.word_state = 'mastered' THEN uwp.word_id END) as mastered_words,
  COUNT(DISTINCT CASE WHEN uwp.next_review <= now() THEN uwp.word_id END) as words_due,
  AVG(uwp.mastery_score) as average_mastery,
  COUNT(DISTINCT ss.id) as total_story_sessions,
  AVG(ss.comprehension_score) as average_comprehension,
  MAX(ss.created_at) as last_study_session
FROM profiles p
LEFT JOIN user_word_progress uwp ON uwp.user_id = p.id
LEFT JOIN story_sessions ss ON ss.user_id = p.id
GROUP BY p.id, p.username;

-- Story session performance
CREATE OR REPLACE VIEW story_session_analytics WITH (security_invoker=true) AS
SELECT 
  ss.*,
  COUNT(DISTINCT swi.word_id) as words_integrated,
  COUNT(DISTINCT sui.id) as total_interactions,
  AVG(CASE WHEN sqr.is_correct THEN 1.0 ELSE 0.0 END) as question_accuracy,
  COUNT(DISTINCT na.id) as news_articles_used
FROM story_sessions ss
LEFT JOIN story_word_integrations swi ON swi.story_session_id = ss.id
LEFT JOIN story_user_interactions sui ON sui.story_session_id = ss.id
LEFT JOIN story_comprehension_questions scq ON scq.story_session_id = ss.id
LEFT JOIN story_question_responses sqr ON sqr.question_id = scq.id
LEFT JOIN LATERAL unnest(ss.integrated_news_articles) AS na_id ON true
LEFT JOIN news_articles na ON na.id = na_id::uuid
GROUP BY ss.id;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to get words due for a user with story context
CREATE OR REPLACE FUNCTION get_user_words_for_story(
  p_user_id UUID,
  p_max_words INTEGER DEFAULT 5,
  p_difficulty_range INTEGER[] DEFAULT ARRAY[1,2,3,4,5]
) RETURNS TABLE(
  word_id UUID,
  word TEXT,
  definition TEXT,
  mastery_score DECIMAL,
  contexts TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w.word,
    w.definition,
    uwp.mastery_score,
    w.common_contexts
  FROM words w
  JOIN user_word_progress uwp ON uwp.word_id = w.id
  WHERE uwp.user_id = p_user_id
    AND uwp.next_review <= now()
    AND w.base_difficulty_level::text::integer = ANY(p_difficulty_range)
  ORDER BY 
    uwp.next_review ASC,
    uwp.mastery_score ASC,
    RANDOM() -- Add some variety
  LIMIT p_max_words;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get relevant news for story generation
CREATE OR REPLACE FUNCTION get_relevant_news(
  p_categories news_category[] DEFAULT ARRAY['world_news', 'technology', 'culture'],
  p_max_articles INTEGER DEFAULT 3,
  p_days_back INTEGER DEFAULT 7,
  p_complexity_level INTEGER DEFAULT 3
) RETURNS TABLE(
  article_id UUID,
  headline TEXT,
  summary TEXT,
  category news_category,
  vocabulary TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    na.id,
    na.headline,
    na.summary,
    na.category,
    na.extracted_vocabulary
  FROM news_articles na
  WHERE na.category = ANY(p_categories)
    AND na.publish_date >= (now() - INTERVAL '1 day' * p_days_back)
    AND na.complexity_level <= p_complexity_level
  ORDER BY 
    na.publish_date DESC,
    array_length(na.extracted_vocabulary, 1) DESC NULLS LAST
  LIMIT p_max_articles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANTS AND PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON words TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_word_progress TO authenticated;
GRANT SELECT ON news_articles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON story_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON story_word_integrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON story_user_interactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON story_comprehension_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON story_question_responses TO authenticated;

-- Grant view access
GRANT SELECT ON words_due_today TO authenticated;
GRANT SELECT ON user_learning_analytics TO authenticated;
GRANT SELECT ON story_session_analytics TO authenticated;

-- Grant function execution
GRANT EXECUTE ON FUNCTION get_user_words_for_story(UUID, INTEGER, INTEGER[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_relevant_news(news_category[], INTEGER, INTEGER, INTEGER) TO authenticated;