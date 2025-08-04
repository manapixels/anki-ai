-- Anki AI Database Schema Migration
-- This migration replaces the recipe schema with a comprehensive flashcard learning system
-- Includes spaced repetition, AI integration, and analytics

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================================
-- ENUMS AND CUSTOM TYPES
-- ============================================================================

-- Study related enums
CREATE TYPE public.card_type AS ENUM('basic', 'cloze', 'image_occlusion', 'audio', 'reverse');
CREATE TYPE public.card_state AS ENUM('new', 'learning', 'review', 'relearning', 'mastered');
CREATE TYPE public.review_quality AS ENUM('again', 'hard', 'good', 'easy', 'perfect');
CREATE TYPE public.session_type AS ENUM('new', 'review', 'mixed', 'cram', 'practice');

-- Deck and content organization
CREATE TYPE public.deck_category AS ENUM(
  'vocabulary', 'grammar', 'phrases', 'idioms', 'academic', 
  'business', 'casual', 'technical', 'other'
);
CREATE TYPE public.difficulty_level AS ENUM('1', '2', '3', '4', '5');

-- AI and analytics
CREATE TYPE public.generation_type AS ENUM(
  'contextual_variations', 'difficulty_adjustment', 'pronunciation_guide',
  'example_generation', 'mnemonic_creation', 'translation_variants',
  'grammar_explanations', 'usage_examples'
);

-- System enums (keep from original)
CREATE TYPE public.app_permission AS ENUM('events.create', 'events.delete');
CREATE TYPE public.unit_system AS ENUM('metric', 'imperial');

-- ============================================================================
-- PROFILES TABLE (Enhanced for study preferences)
-- ============================================================================

CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  username TEXT NOT NULL UNIQUE,
  
  -- Study preferences
  preferred_unit_system unit_system DEFAULT 'metric',
  timezone TEXT DEFAULT 'UTC',
  daily_study_goal INTEGER DEFAULT 20, -- cards per day
  max_new_cards INTEGER DEFAULT 10,
  max_review_cards INTEGER DEFAULT 100,
  preferred_study_time TIME,
  
  -- AI preferences
  ai_difficulty_adjustment BOOLEAN DEFAULT true,
  ai_content_generation BOOLEAN DEFAULT true,
  preferred_languages TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments
COMMENT ON TABLE public.profiles IS 'Enhanced user profiles with study preferences and AI settings.';
COMMENT ON COLUMN public.profiles.daily_study_goal IS 'Daily target for cards to study';
COMMENT ON COLUMN public.profiles.max_new_cards IS 'Maximum new cards per study session';
COMMENT ON COLUMN public.profiles.max_review_cards IS 'Maximum review cards per study session';

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid() = id);

-- ============================================================================
-- DECKS TABLE (Replaces recipes)
-- ============================================================================

CREATE TABLE public.decks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  
  -- Organization
  category deck_category NOT NULL DEFAULT 'other',
  difficulty_level difficulty_level NOT NULL DEFAULT '1',
  tags TEXT[] DEFAULT '{}',
  
  -- Visibility and sharing
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  -- Metadata
  language TEXT DEFAULT 'en',
  target_language TEXT, -- for language learning decks
  estimated_study_time INTEGER DEFAULT 0, -- minutes
  
  -- Stats (updated by triggers)
  card_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  study_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.0,
  
  -- Ownership and timestamps
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Comments
COMMENT ON TABLE public.decks IS 'Flashcard collections (replaces recipes table)';
COMMENT ON COLUMN public.decks.slug IS 'URL-friendly identifier generated from name';
COMMENT ON COLUMN public.decks.estimated_study_time IS 'Estimated time to complete deck in minutes';

-- RLS for decks
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public decks viewable by everyone" ON decks FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own decks" ON decks FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can update own decks" ON decks FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own decks" ON decks FOR DELETE USING (auth.uid() = created_by);
CREATE POLICY "Users can insert decks" ON decks FOR INSERT WITH CHECK (auth.uid() = created_by);

-- ============================================================================
-- CARDS TABLE (Core flashcard content)
-- ============================================================================

CREATE TABLE public.cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  
  -- Card content
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  card_type card_type DEFAULT 'basic',
  
  -- Additional content
  notes TEXT, -- study notes or hints
  examples TEXT[], -- usage examples
  pronunciation TEXT, -- phonetic pronunciation
  audio_url TEXT, -- pronunciation audio
  image_url TEXT, -- associated image
  
  -- Organization
  tags TEXT[] DEFAULT '{}',
  difficulty_level difficulty_level DEFAULT '1',
  
  -- Metadata
  language TEXT DEFAULT 'en',
  etymology TEXT, -- word origin for vocabulary
  part_of_speech TEXT, -- noun, verb, etc.
  
  -- AI generation tracking
  is_ai_generated BOOLEAN DEFAULT false,
  generation_source UUID, -- reference to ai_generations table
  
  -- Timestamps
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Comments
COMMENT ON TABLE public.cards IS 'Individual flashcards with front/back content and metadata';
COMMENT ON COLUMN public.cards.front_text IS 'Question or prompt side of the card';
COMMENT ON COLUMN public.cards.back_text IS 'Answer or content side of the card';
COMMENT ON COLUMN public.cards.notes IS 'Study hints or additional notes';

-- RLS for cards
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cards viewable through deck permissions" ON cards FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM decks d 
    WHERE d.id = deck_id 
    AND (d.is_public = true OR d.created_by = auth.uid())
  )
);
CREATE POLICY "Users can manage cards in own decks" ON cards FOR ALL USING (
  EXISTS (
    SELECT 1 FROM decks d 
    WHERE d.id = deck_id 
    AND d.created_by = auth.uid()
  )
);

-- ============================================================================
-- CARD REVIEWS TABLE (Spaced repetition data)
-- ============================================================================

CREATE TABLE public.card_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Spaced repetition algorithm data
  ease_factor DECIMAL(4,2) DEFAULT 2.50, -- SM-2 ease factor
  interval INTEGER DEFAULT 1, -- days until next review
  repetitions INTEGER DEFAULT 0, -- number of successful reviews
  next_review TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Current state
  card_state card_state DEFAULT 'new',
  last_quality review_quality,
  
  -- Performance tracking
  total_reviews INTEGER DEFAULT 0,
  correct_reviews INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0, -- current correct streak
  best_streak INTEGER DEFAULT 0,
  
  -- Timing data
  average_response_time INTEGER DEFAULT 0, -- milliseconds
  last_reviewed TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure one review record per user per card
  CONSTRAINT unique_user_card_review UNIQUE (user_id, card_id)
);

-- Comments
COMMENT ON TABLE public.card_reviews IS 'Spaced repetition data and performance tracking for user-card pairs';
COMMENT ON COLUMN public.card_reviews.ease_factor IS 'SM-2 algorithm ease factor (higher = easier)';
COMMENT ON COLUMN public.card_reviews.interval IS 'Days until next review';
COMMENT ON COLUMN public.card_reviews.next_review IS 'Scheduled time for next review';

-- RLS for card reviews
ALTER TABLE card_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own card reviews" ON card_reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own card reviews" ON card_reviews FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- STUDY SESSIONS TABLE (Session tracking and analytics)
-- ============================================================================

CREATE TABLE public.study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  
  -- Session details
  session_type session_type NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  
  -- Session statistics
  cards_studied INTEGER DEFAULT 0,
  new_cards INTEGER DEFAULT 0,
  review_cards INTEGER DEFAULT 0,
  relearning_cards INTEGER DEFAULT 0,
  
  -- Performance metrics
  correct_answers INTEGER DEFAULT 0,
  total_time INTEGER DEFAULT 0, -- seconds
  average_response_time INTEGER DEFAULT 0, -- milliseconds
  
  -- Session metadata
  session_data JSONB DEFAULT '{}'::jsonb, -- detailed session information
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments
COMMENT ON TABLE public.study_sessions IS 'Individual study session records with performance metrics';
COMMENT ON COLUMN public.study_sessions.total_time IS 'Total session time in seconds';
COMMENT ON COLUMN public.study_sessions.session_data IS 'Detailed session data and card-level performance';

-- RLS for study sessions
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own study sessions" ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own study sessions" ON study_sessions FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- AI GENERATIONS TABLE (AI content tracking)
-- ============================================================================

CREATE TABLE public.ai_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Generation request details
  generation_type generation_type NOT NULL,
  original_content TEXT NOT NULL,
  generated_content JSONB NOT NULL,
  
  -- Request context
  context JSONB DEFAULT '{}'::jsonb, -- original request parameters
  
  -- AI model information
  model_used TEXT DEFAULT 'gpt-3.5-turbo',
  tokens_used INTEGER DEFAULT 0,
  generation_time INTEGER DEFAULT 0, -- milliseconds
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  
  -- Usage tracking
  cards_created INTEGER DEFAULT 0, -- number of cards created from this generation
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments
COMMENT ON TABLE public.ai_generations IS 'Tracks AI-generated content and usage statistics';
COMMENT ON COLUMN public.ai_generations.generated_content IS 'JSON array of generated card variations';
COMMENT ON COLUMN public.ai_generations.context IS 'Original request parameters and user preferences';

-- RLS for AI generations
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI generations" ON ai_generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own AI generations" ON ai_generations FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- DECK SHARING AND RATINGS
-- ============================================================================

-- User favorite decks (replaces user_favorite_recipes)
CREATE TABLE public.user_favorite_decks (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  CONSTRAINT user_favorite_decks_pkey PRIMARY KEY (user_id, deck_id)
);

-- Deck ratings and reviews
CREATE TABLE public.deck_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  CONSTRAINT deck_ratings_unique_user_deck UNIQUE (deck_id, user_id)
);

-- RLS for deck interactions
ALTER TABLE user_favorite_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public deck favorites" ON user_favorite_decks FOR SELECT USING (
  EXISTS (SELECT 1 FROM decks d WHERE d.id = deck_id AND d.is_public = true)
);
CREATE POLICY "Users can manage own favorites" ON user_favorite_decks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view deck ratings" ON deck_ratings FOR SELECT USING (true);
CREATE POLICY "Users can manage own ratings" ON deck_ratings FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Deck indexes
CREATE INDEX idx_decks_created_by ON decks(created_by);
CREATE INDEX idx_decks_category ON decks(category);
CREATE INDEX idx_decks_public ON decks(is_public) WHERE is_public = true;
CREATE INDEX idx_decks_featured ON decks(is_featured) WHERE is_featured = true;

-- Card indexes
CREATE INDEX idx_cards_deck_id ON cards(deck_id);
CREATE INDEX idx_cards_created_by ON cards(created_by);
CREATE INDEX idx_cards_type ON cards(card_type);
CREATE INDEX idx_cards_difficulty ON cards(difficulty_level);

-- Card review indexes (critical for spaced repetition)
CREATE INDEX idx_card_reviews_user_id ON card_reviews(user_id);
CREATE INDEX idx_card_reviews_card_id ON card_reviews(card_id);
CREATE INDEX idx_card_reviews_next_review ON card_reviews(next_review);
CREATE INDEX idx_card_reviews_state ON card_reviews(card_state);
CREATE INDEX idx_card_reviews_user_due ON card_reviews(user_id, next_review) WHERE next_review <= now();

-- Study session indexes
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_deck_id ON study_sessions(deck_id);
CREATE INDEX idx_study_sessions_start_time ON study_sessions(start_time);

-- AI generation indexes
CREATE INDEX idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX idx_ai_generations_type ON ai_generations(generation_type);
CREATE INDEX idx_ai_generations_created_at ON ai_generations(created_at);

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Slugify function (reuse from original)
CREATE OR REPLACE FUNCTION slugify("value" TEXT) RETURNS TEXT AS $$
  WITH "unaccented" AS (
    SELECT unaccent("value") AS "value"
  ),
  "lowercase" AS (
    SELECT lower("value") AS "value"
    FROM "unaccented"
  ),
  "removed_quotes" AS (
    SELECT regexp_replace("value", '[''"]+', '', 'gi') AS "value"
    FROM "lowercase"
  ),
  "hyphenated" AS (
    SELECT regexp_replace("value", '[^a-z0-9\\-_]+', '-', 'gi') AS "value"
    FROM "removed_quotes"
  ),
  "trimmed" AS (
    SELECT regexp_replace(regexp_replace("value", '\-+$', ''), '^\-', '') AS "value"
    FROM "hyphenated"
  )
  SELECT "value" FROM "trimmed";
$$ LANGUAGE SQL STRICT IMMUTABLE;

-- Generate unique deck slug
CREATE OR REPLACE FUNCTION public.set_deck_slug() RETURNS TRIGGER AS $$
DECLARE
    new_slug TEXT;
    slug_count INT;
BEGIN
    new_slug := slugify(NEW.name);
    slug_count := 1;

    -- Check if the slug already exists and append a number to make it unique
    LOOP
        SELECT count(*) INTO slug_count FROM public.decks WHERE slug = new_slug;
        EXIT WHEN slug_count = 0;
        new_slug := new_slug || '-' || slug_count;
        slug_count := slug_count + 1;
    END LOOP;

    NEW.slug := new_slug;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate next review date using SM-2 algorithm
CREATE OR REPLACE FUNCTION calculate_next_review(
  current_ease DECIMAL,
  current_interval INTEGER,
  quality INTEGER
) RETURNS TABLE(
  new_ease DECIMAL,
  new_interval INTEGER,
  next_review TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  calculated_ease DECIMAL;
  calculated_interval INTEGER;
BEGIN
  -- SM-2 Algorithm implementation
  calculated_ease := current_ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  -- Minimum ease factor of 1.3
  IF calculated_ease < 1.3 THEN
    calculated_ease := 1.3;
  END IF;
  
  -- Calculate interval based on quality
  IF quality < 3 THEN
    -- Failed review - reset to 1 day
    calculated_interval := 1;
  ELSE
    -- Successful review
    IF current_interval <= 1 THEN
      calculated_interval := 6; -- First successful review
    ELSE
      calculated_interval := ROUND(current_interval * calculated_ease);
    END IF;
  END IF;
  
  RETURN QUERY SELECT 
    calculated_ease,
    calculated_interval,
    (now() + INTERVAL '1 day' * calculated_interval)::TIMESTAMP WITH TIME ZONE;
END;
$$ LANGUAGE plpgsql;

-- Update deck statistics
CREATE OR REPLACE FUNCTION update_deck_stats() RETURNS TRIGGER AS $$
BEGIN
  -- Update card count for the affected deck(s)
  IF TG_OP = 'DELETE' THEN
    UPDATE decks SET 
      card_count = (SELECT COUNT(*) FROM cards WHERE deck_id = OLD.deck_id),
      updated_at = now()
    WHERE id = OLD.deck_id;
    RETURN OLD;
  ELSE
    UPDATE decks SET 
      card_count = (SELECT COUNT(*) FROM cards WHERE deck_id = NEW.deck_id),
      updated_at = now()
    WHERE id = NEW.deck_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-generate deck slugs
CREATE TRIGGER set_deck_slug BEFORE INSERT ON public.decks 
  FOR EACH ROW EXECUTE FUNCTION set_deck_slug();

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_decks_updated_at BEFORE UPDATE ON public.decks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON public.cards 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_reviews_updated_at BEFORE UPDATE ON public.card_reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update deck statistics when cards change
CREATE TRIGGER update_deck_card_count 
  AFTER INSERT OR UPDATE OR DELETE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION update_deck_stats();

-- ============================================================================
-- VIEWS FOR ANALYTICS AND QUERIES
-- ============================================================================

-- Decks with enhanced metadata and statistics
CREATE OR REPLACE VIEW decks_with_stats WITH (security_invoker=true) AS
SELECT 
  d.*,
  json_build_object(
    'id', p.id,
    'name', p.name,
    'username', p.username,
    'avatar_url', p.avatar_url
  ) AS created_by_profile,
  COALESCE(avg(dr.rating), 0) as average_rating,
  count(dr.rating) as rating_count,
  count(ufd.user_id) as favorite_count
FROM decks d
LEFT JOIN profiles p ON p.id = d.created_by
LEFT JOIN deck_ratings dr ON dr.deck_id = d.id
LEFT JOIN user_favorite_decks ufd ON ufd.deck_id = d.id
GROUP BY d.id, p.id, p.name, p.username, p.avatar_url;

-- User study progress overview
CREATE OR REPLACE VIEW user_study_progress WITH (security_invoker=true) AS
SELECT 
  cr.user_id,
  d.id as deck_id,
  d.name as deck_name,
  COUNT(*) as total_cards,
  SUM(CASE WHEN cr.card_state = 'new' THEN 1 ELSE 0 END) as new_cards,
  SUM(CASE WHEN cr.card_state = 'learning' THEN 1 ELSE 0 END) as learning_cards,
  SUM(CASE WHEN cr.card_state = 'review' THEN 1 ELSE 0 END) as review_cards,
  SUM(CASE WHEN cr.card_state = 'mastered' THEN 1 ELSE 0 END) as mastered_cards,
  AVG(cr.ease_factor) as average_ease,
  (SUM(CASE WHEN cr.card_state = 'mastered' THEN 1 ELSE 0 END)::FLOAT / COUNT(*)::FLOAT * 100) as mastery_percentage,
  MAX(cr.last_reviewed) as last_studied
FROM card_reviews cr
JOIN cards c ON c.id = cr.card_id
JOIN decks d ON d.id = c.deck_id
GROUP BY cr.user_id, d.id, d.name;

-- Due cards for study sessions
CREATE OR REPLACE VIEW due_cards WITH (security_invoker=true) AS
SELECT 
  c.*,
  cr.user_id,
  cr.card_state,
  cr.next_review,
  cr.ease_factor,
  cr.interval,
  d.name as deck_name
FROM cards c
JOIN card_reviews cr ON cr.card_id = c.id
JOIN decks d ON d.id = c.deck_id
WHERE cr.next_review <= now()
ORDER BY cr.next_review ASC;

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('card_images', 'card_images', true),
  ('card_audio', 'card_audio', true);

-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================================

DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE decks, cards, study_sessions;

-- ============================================================================
-- PERMISSIONS AND GRANTS
-- ============================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON decks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON card_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON study_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_generations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_favorite_decks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON deck_ratings TO authenticated;

-- Grant view access
GRANT SELECT ON decks_with_stats TO authenticated, anon;
GRANT SELECT ON user_study_progress TO authenticated;
GRANT SELECT ON due_cards TO authenticated;

-- Grant function execution
GRANT EXECUTE ON FUNCTION calculate_next_review(DECIMAL, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_deck_stats() TO authenticated;