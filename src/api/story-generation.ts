'use server';

import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';
import type { 
  StoryGenerationRequest, 
  GeneratedStory, 
  NewsElement, 
  TargetWord,
  UserLearningPreferences,
  NewsIntegrationSettings
} from '@/types/story-learning';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateAdaptiveStory(
  userId: string,
  maxWords: number = 5,
  includeNews: boolean = true
): Promise<{ story: GeneratedStory; session_id: string } | { error: string }> {
  try {
    const supabase = createClient();
    
    // Get user's words due for review
    const wordsData = await supabase.rpc('get_user_words_for_story', {
      p_user_id: userId,
      p_max_words: maxWords
    });

    if (wordsData.error) {
      return { error: 'Failed to fetch user words: ' + wordsData.error.message };
    }

    if (!wordsData.data || wordsData.data.length === 0) {
      return { error: 'No words due for review found' };
    }

    // Get user preferences
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('story_preferences')
      .eq('id', userId)
      .single();

    const preferences = userProfile?.story_preferences as any || {};
    
    // Get relevant news if requested
    let newsArticles: any[] = [];
    if (includeNews && preferences.news_integration?.include_news !== false) {
      const newsData = await supabase.rpc('get_relevant_news', {
        p_categories: preferences.news_integration?.preferred_categories || ['world_news', 'technology', 'culture'],
        p_max_articles: preferences.news_integration?.max_news_elements || 2,
        p_days_back: getNewsRecencyDays(preferences.news_integration?.news_recency || 'this_week'),
        p_complexity_level: 3
      });

      if (newsData.data) {
        newsArticles = newsData.data;
      }
    }

    // Generate story using OpenAI
    const story = await generateStoryWithAI(
      wordsData.data,
      newsArticles,
      preferences
    );

    // Create story session in database
    const { data: sessionData, error: sessionError } = await supabase
      .from('story_sessions')
      .insert({
        user_id: userId,
        target_words: wordsData.data.map((w: any) => w.word_id),
        story_title: story.title,
        story_content: story.content,
        story_type: story.story_type,
        complexity_level: story.complexity_level,
        estimated_reading_time: story.estimated_reading_time,
        integrated_news_articles: newsArticles.map(n => n.article_id),
        cultural_context: story.cultural_context,
        status: 'active'
      })
      .select()
      .single();

    if (sessionError) {
      return { error: 'Failed to create story session: ' + sessionError.message };
    }

    // Insert word integration points
    if (story.word_integration_points && story.word_integration_points.length > 0) {
      const integrations = story.word_integration_points.map(point => ({
        story_session_id: sessionData.id,
        word_id: getWordIdByText(wordsData.data, point.word),
        position_in_story: point.position,
        integration_type: point.integration_type,
        emphasis_type: point.learning_emphasis,
        context_strength: point.context_strength,
        word_form_used: point.word,
        alternative_forms: point.alternative_forms || []
      })).filter(i => i.word_id); // Only include valid word IDs

      await supabase
        .from('story_word_integrations')
        .insert(integrations);
    }

    // Insert comprehension questions if generated
    if (story.comprehension_questions) {
      const questions = story.comprehension_questions.map(q => ({
        story_session_id: sessionData.id,
        question: q.question,
        question_type: q.question_type,
        target_words: q.target_words.map(word => getWordIdByText(wordsData.data, word)).filter(Boolean),
        correct_answer: q.correct_answer,
        multiple_choice_options: q.multiple_choice_options || [],
        explanation: q.explanation,
        difficulty_level: q.difficulty_level
      }));

      await supabase
        .from('story_comprehension_questions')
        .insert(questions);
    }

    return { 
      story,
      session_id: sessionData.id 
    };

  } catch (error) {
    console.error('Story generation error:', error);
    return { error: 'Failed to generate story: ' + (error as Error).message };
  }
}

async function generateStoryWithAI(
  targetWords: any[],
  newsArticles: any[],
  userPreferences: any
): Promise<GeneratedStory> {
  
  const wordsToLearn = targetWords.map(w => ({
    word: w.word,
    definition: w.definition,
    contexts: w.contexts || [],
    mastery: w.mastery_score
  }));

  // Build context for AI
  const newsContext = newsArticles.length > 0 ? 
    `Recent news to potentially incorporate:\n${newsArticles.map(n => 
      `- ${n.headline}: ${n.summary}`
    ).join('\n')}\n\n` : '';

  const userContext = `
User preferences:
- Interests: ${userPreferences.interests?.join(', ') || 'general'}
- Attention span: ${userPreferences.attention_span || 'medium'}
- Cultural background: ${userPreferences.cultural_background || 'mixed'}
- Learning goals: ${userPreferences.learning_goals?.join(', ') || 'vocabulary building'}
`;

  const prompt = `You are an AI language learning assistant that creates engaging, contextual stories to help users learn vocabulary naturally.

${newsContext}${userContext}

TARGET WORDS TO INTEGRATE:
${wordsToLearn.map((w, i) => 
  `${i + 1}. "${w.word}" - ${w.definition} (mastery: ${Math.round(w.mastery * 100)}%)`
).join('\n')}

TASK: Create an engaging story that:
1. Naturally integrates ALL target words in meaningful contexts
2. ${newsArticles.length > 0 ? 'Incorporates elements from the recent news provided' : 'Uses current, relevant scenarios'}
3. Matches the user's interests and cultural background
4. Provides rich context clues for word meanings
5. Maintains narrative flow while emphasizing learning

REQUIREMENTS:
- Story length: 200-400 words (readable in 2-3 minutes)
- Include each target word at least once, some can appear multiple times
- Use varied sentence structures and contexts
- Make the story memorable and engaging
- Include subtle cultural elements when appropriate

RESPONSE FORMAT: JSON object with:
{
  "title": "Engaging story title",
  "content": "The complete story text",
  "story_type": "news_adaptation|scenario_simulation|narrative_adventure|dialogue_conversation|documentary_style|personal_journal",
  "complexity_level": 1-5,
  "estimated_reading_time": minutes,
  "word_integration_points": [
    {
      "word": "target_word",
      "position": character_position_in_story,
      "integration_type": "natural_flow|definition_embedded|contrast_comparison|repetition_reinforcement|cultural_explanation",
      "context_strength": 1-10,
      "learning_emphasis": "subtle|highlighted|interactive|quiz_integrated",
      "alternative_forms": ["if applicable"]
    }
  ],
  "news_elements": [
    {
      "headline": "news headline used",
      "source": "source name",
      "category": "news category",
      "relevance_score": 1-10,
      "integrated_words": ["words from news"],
      "context_adaptation": "how news was adapted"
    }
  ],
  "cultural_context": {
    "cultural_elements": ["cultural aspects included"],
    "social_context": "social setting description",
    "idiomatic_expressions": ["any idioms used"]
  },
  "comprehension_questions": [
    {
      "question": "Question text",
      "question_type": "word_meaning|story_comprehension|word_usage|context_inference|cultural_understanding|news_connection",
      "target_words": ["words this tests"],
      "correct_answer": "correct answer",
      "multiple_choice_options": ["option A", "option B", "option C", "option D"],
      "explanation": "why this is correct",
      "difficulty_level": 1-5
    }
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are an expert language learning content creator. Create engaging, contextual stories that naturally integrate vocabulary learning with current events and user interests. Always respond with valid JSON."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.8, // Higher creativity for story generation
    max_tokens: 2000,
    response_format: { type: "json_object" }
  });

  const response = completion.choices[0]?.message?.content;
  if (!response) {
    throw new Error('No response from OpenAI');
  }

  try {
    const storyData = JSON.parse(response);
    
    // Validate and structure the response
    return {
      title: storyData.title,
      content: storyData.content,
      story_type: storyData.story_type || 'narrative_adventure',
      complexity_level: storyData.complexity_level || 2,
      word_integration_points: storyData.word_integration_points || [],
      news_elements: storyData.news_elements || [],
      cultural_context: storyData.cultural_context || {},
      estimated_reading_time: storyData.estimated_reading_time || 3,
      comprehension_questions: storyData.comprehension_questions || []
    };

  } catch (parseError) {
    console.error('Failed to parse AI response:', response);
    throw new Error('Invalid AI response format');
  }
}

export async function recordUserInteraction(
  sessionId: string,
  wordId: string | null,
  interactionType: string,
  userResponse?: string,
  correctnessScore?: number,
  timeTaken?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('story_user_interactions')
      .insert({
        story_session_id: sessionId,
        word_id: wordId,
        interaction_type: interactionType,
        user_response: userResponse,
        correctness_score: correctnessScore,
        time_taken: timeTaken,
        additional_context: {}
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };

  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function completeStorySession(
  sessionId: string,
  comprehensionScore: number,
  readingTime: number,
  difficultyRating?: number,
  relevanceRating?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('story_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        actual_reading_time: readingTime,
        comprehension_score: comprehensionScore,
        difficulty_rating: difficultyRating,
        relevance_rating: relevanceRating,
        completion_percentage: 100
      })
      .eq('id', sessionId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Update word progress based on session performance
    await updateWordProgressFromSession(sessionId, comprehensionScore);

    return { success: true };

  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function updateWordProgressFromSession(
  sessionId: string,
  comprehensionScore: number
): Promise<void> {
  // This would implement spaced repetition updates based on story performance
  // For now, placeholder implementation
  const supabase = createClient();
  
  // Get session and word data
  const { data: session } = await supabase
    .from('story_sessions')
    .select('user_id, target_words')
    .eq('id', sessionId)
    .single();

  if (!session) return;

  // Update word progress for each target word
  // This is a simplified version - real implementation would be more sophisticated
  const qualityScore = comprehensionScore >= 0.8 ? 4 : comprehensionScore >= 0.6 ? 3 : 2;
  
  for (const wordId of session.target_words) {
    // Update using spaced repetition algorithm
    // This would call the calculate_next_review function
  }
}

// Helper functions
function getNewsRecencyDays(recency: string): number {
  switch (recency) {
    case 'today': return 1;
    case 'this_week': return 7;
    case 'this_month': return 30;
    default: return 7;
  }
}

function getWordIdByText(wordsData: any[], wordText: string): string | null {
  const found = wordsData.find(w => w.word.toLowerCase() === wordText.toLowerCase());
  return found?.word_id || null;
}