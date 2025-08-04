'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, BookOpen, Clock, Target, TrendingUp } from 'lucide-react';
import type { GeneratedStory } from '@/types/story-learning';
import { generateAdaptiveStory, recordUserInteraction, completeStorySession } from '@/api/story-generation';

interface StoryLearningInterfaceProps {
  userId: string;
  onComplete?: (sessionId: string, performance: SessionPerformance) => void;
}

interface SessionPerformance {
  comprehensionScore: number;
  readingTime: number;
  wordsLearned: number;
  engagementScore: number;
}

interface WordHighlight {
  word: string;
  definition: string;
  startPos: number;
  endPos: number;
  isTarget: boolean;
}

export default function StoryLearningInterface({ userId, onComplete }: StoryLearningInterfaceProps) {
  const [story, setStory] = useState<GeneratedStory | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [readingStartTime, setReadingStartTime] = useState<Date | null>(null);
  const [totalReadingTime, setTotalReadingTime] = useState(0);
  const [highlightedWords, setHighlightedWords] = useState<WordHighlight[]>([]);
  const [selectedWord, setSelectedWord] = useState<WordHighlight | null>(null);
  const [showDefinition, setShowDefinition] = useState(false);
  const [userInteractions, setUserInteractions] = useState<any[]>([]);
  const [showComprehensionQuestions, setShowComprehensionQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, string>>({});
  const [sessionComplete, setSessionComplete] = useState(false);

  const readingTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    generateNewStory();
    return () => {
      if (readingTimerRef.current) {
        clearInterval(readingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isReading && readingStartTime) {
      readingTimerRef.current = setInterval(() => {
        setTotalReadingTime(Math.floor((Date.now() - readingStartTime.getTime()) / 1000));
      }, 1000);
    } else {
      if (readingTimerRef.current) {
        clearInterval(readingTimerRef.current);
      }
    }

    return () => {
      if (readingTimerRef.current) {
        clearInterval(readingTimerRef.current);
      }
    };
  }, [isReading, readingStartTime]);

  const generateNewStory = async () => {
    setLoading(true);
    try {
      const result = await generateAdaptiveStory(userId, 5, true);
      
      if ('error' in result) {
        console.error('Story generation error:', result.error);
        return;
      }

      setStory(result.story);
      setSessionId(result.session_id);
      
      // Process word integration points for highlighting
      if (result.story.word_integration_points) {
        const highlights = result.story.word_integration_points.map(point => ({
          word: point.word,
          definition: '', // Would be fetched from the database
          startPos: point.position,
          endPos: point.position + point.word.length,
          isTarget: true
        }));
        setHighlightedWords(highlights);
      }

    } catch (error) {
      console.error('Failed to generate story:', error);
    } finally {
      setLoading(false);
    }
  };

  const startReading = () => {
    setIsReading(true);
    setReadingStartTime(new Date());
    recordInteraction('story_start');
  };

  const pauseReading = () => {
    setIsReading(false);
    if (readingStartTime) {
      const sessionTime = Math.floor((Date.now() - readingStartTime.getTime()) / 1000);
      setTotalReadingTime(prev => prev + sessionTime);
    }
  };

  const recordInteraction = async (type: string, wordId?: string, response?: string, score?: number) => {
    const interaction = {
      type,
      wordId,
      response,
      score,
      timestamp: new Date().toISOString(),
      timeTaken: isReading ? Math.floor((Date.now() - (readingStartTime?.getTime() || 0)) / 1000) : 0
    };

    setUserInteractions(prev => [...prev, interaction]);

    if (sessionId) {
      await recordUserInteraction(sessionId, wordId || null, type, response, score, interaction.timeTaken);
    }
  };

  const handleWordClick = async (word: string, position: number) => {
    const highlight = highlightedWords.find(h => 
      position >= h.startPos && position <= h.endPos
    );

    if (highlight) {
      setSelectedWord(highlight);
      setShowDefinition(true);
      await recordInteraction('word_click', word);
    }
  };

  const finishReading = () => {
    pauseReading();
    if (story?.comprehension_questions && story.comprehension_questions.length > 0) {
      setShowComprehensionQuestions(true);
    } else {
      completeSession();
    }
  };

  const handleQuestionAnswer = (questionIndex: number, answer: string) => {
    setQuestionAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const submitComprehensionAnswers = async () => {
    // Calculate comprehension score
    const correctAnswers = story?.comprehension_questions?.filter((q, index) => 
      questionAnswers[index] === q.correct_answer
    ).length || 0;
    
    const totalQuestions = story?.comprehension_questions?.length || 1;
    const comprehensionScore = correctAnswers / totalQuestions;

    await recordInteraction('story_completion', undefined, undefined, comprehensionScore);
    completeSession(comprehensionScore);
  };

  const completeSession = async (comprehensionScore: number = 0.8) => {
    const performance: SessionPerformance = {
      comprehensionScore,
      readingTime: totalReadingTime,
      wordsLearned: highlightedWords.length,
      engagementScore: Math.min(userInteractions.length / 10, 1) // Simple engagement calculation
    };

    if (sessionId) {
      await completeStorySession(sessionId, comprehensionScore, totalReadingTime);
    }

    setSessionComplete(true);
    onComplete?.(sessionId, performance);
  };

  const renderStoryWithHighlights = (content: string) => {
    if (!highlightedWords.length) {
      return <p className="text-lg leading-relaxed">{content}</p>;
    }

    // Simple highlighting - in production, would use more sophisticated text processing
    let highlightedContent = content;
    highlightedWords.forEach(highlight => {
      const regex = new RegExp(`\\b${highlight.word}\\b`, 'gi');
      highlightedContent = highlightedContent.replace(regex, 
        `<span class="bg-blue-100 text-blue-800 px-1 py-0.5 rounded cursor-pointer hover:bg-blue-200 transition-colors" data-word="${highlight.word}">${highlight.word}</span>`
      );
    });

    return (
      <div 
        className="text-lg leading-relaxed"
        dangerouslySetInnerHTML={{ __html: highlightedContent }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.dataset.word) {
            handleWordClick(target.dataset.word, 0);
          }
        }}
      />
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your personalized story...</p>
          <p className="text-sm text-gray-500 mt-2">Weaving together your vocabulary with current events</p>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-green-50 rounded-lg p-8 mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Story Complete!</h2>
          <p className="text-green-700">Great job learning through contextual storytelling</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border">
            <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Reading Time</p>
            <p className="text-xl font-semibold">{formatTime(totalReadingTime)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Words Learned</p>
            <p className="text-xl font-semibold">{highlightedWords.length}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={generateNewStory}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Read Another Story
          </button>
          <button
            onClick={() => window.location.href = '/study'}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Study
          </button>
        </div>
      </div>
    );
  }

  if (showComprehensionQuestions && story?.comprehension_questions) {
    const currentQuestion = story.comprehension_questions[currentQuestionIndex];
    
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Comprehension Check</h2>
            <span className="text-sm text-gray-500">
              {currentQuestionIndex + 1} of {story.comprehension_questions.length}
            </span>
          </div>
          
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
            
            {currentQuestion.multiple_choice_options ? (
              <div className="space-y-2">
                {currentQuestion.multiple_choice_options.map((option, index) => (
                  <label key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      value={option}
                      checked={questionAnswers[currentQuestionIndex] === option}
                      onChange={(e) => handleQuestionAnswer(currentQuestionIndex, e.target.value)}
                      className="text-blue-600"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                className="w-full p-3 border rounded-lg"
                rows={3}
                placeholder="Type your answer here..."
                value={questionAnswers[currentQuestionIndex] || ''}
                onChange={(e) => handleQuestionAnswer(currentQuestionIndex, e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {currentQuestionIndex < story.comprehension_questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              disabled={!questionAnswers[currentQuestionIndex]}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submitComprehensionAnswers}
              disabled={!questionAnswers[currentQuestionIndex]}
              className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No story available</p>
        <button
          onClick={generateNewStory}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Generate Story
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Story Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{story.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {story.estimated_reading_time} min read
              </span>
              <span className="flex items-center">
                <Target className="w-4 h-4 mr-1" />
                {highlightedWords.length} words to learn
              </span>
              {story.news_elements && story.news_elements.length > 0 && (
                <span className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Current events
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-lg font-mono">{formatTime(totalReadingTime)}</span>
            {!isReading ? (
              <button
                onClick={startReading}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={pauseReading}
                className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Pause className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={generateNewStory}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* News Integration Indicator */}
        {story.news_elements && story.news_elements.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              This story incorporates recent news from{' '}
              {story.news_elements.map(ne => ne.source).join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Story Content */}
      <div className="bg-white rounded-lg border p-8 mb-6">
        {renderStoryWithHighlights(story.content)}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={finishReading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          I'm Done Reading
        </button>
      </div>

      {/* Word Definition Modal */}
      {showDefinition && selectedWord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">{selectedWord.word}</h3>
            <p className="text-gray-700 mb-4">{selectedWord.definition}</p>
            <button
              onClick={() => setShowDefinition(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}