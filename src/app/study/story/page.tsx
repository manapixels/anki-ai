import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import StoryLearningInterface from '../_components/StoryLearningInterface';

export const metadata: Metadata = {
  title: 'Adaptive Story Learning | Anki AI',
  description: 'Learn vocabulary through engaging stories that incorporate current events and your personal learning goals',
};

export default async function StoryLearningPage() {
  const supabase = createClient();
  
  // Check authentication
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/auth');
  }

  // Get user profile to check if they have words to learn
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
            Powered by AI + Current Events
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Learn Through Living Stories
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Instead of boring flashcards, learn vocabulary through engaging stories that weave together 
            your target words with current news and real-world contexts. Every story is unique and 
            personalized just for you.
          </p>

          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 font-bold">AI</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Smart Integration</h3>
              <p className="text-sm text-gray-600">AI weaves your vocabulary into compelling narratives</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 text-xl">📰</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Current Events</h3>
              <p className="text-sm text-gray-600">Stories incorporate real-world news and trends</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 text-xl">🧠</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Better Retention</h3>
              <p className="text-sm text-gray-600">Context-rich stories stick in memory longer</p>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            How Adaptive Story Learning Works
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">AI Analyzes Your Progress</h3>
                  <p className="text-gray-600 text-sm">
                    Our system identifies which words you need to practice based on your learning history and performance.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Gathers Current Context</h3>
                  <p className="text-gray-600 text-sm">
                    Recent news articles and trending topics are analyzed to find relevant contexts for your vocabulary.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Creates Your Unique Story</h3>
                  <p className="text-gray-600 text-sm">
                    AI generates an engaging narrative that naturally incorporates your target words within meaningful contexts.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Example Story Preview</h4>
              <div className="text-sm text-gray-700 leading-relaxed space-y-2">
                <p>
                  "As Sarah browsed the latest <span className="bg-blue-100 px-1 rounded">technology</span> news, 
                  she felt a surge of <span className="bg-blue-100 px-1 rounded">anticipation</span>. The breakthrough in 
                  artificial intelligence wasn't just <span className="bg-blue-100 px-1 rounded">theoretical</span> anymore..."
                </p>
                <p className="text-xs text-gray-500 italic">
                  ✓ Incorporates your target words naturally<br/>
                  ✓ Based on real tech news from this week<br/>
                  ✓ Matches your interests and learning level
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Interface */}
        <StoryLearningInterface 
          userId={user.id}
          onComplete={(sessionId, performance) => {
            console.log('Story session completed:', { sessionId, performance });
          }}
        />

        {/* Learning Tips */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            💡 Tips for Maximum Learning
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">📖 Read Actively</h3>
              <p className="text-gray-600">
                Click on highlighted words to see definitions and examples. Don't just read passively!
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">🤔 Think Contextually</h3>
              <p className="text-gray-600">
                Try to understand how each word fits in the story's context, not just its definition.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">🔄 Review Regularly</h3>
              <p className="text-gray-600">
                Come back daily for new stories that reinforce previous words while introducing new ones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}