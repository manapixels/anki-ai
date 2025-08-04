import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Decks | Anki AI',
  description: 'Manage your flashcard decks and study progress',
};

export default function DecksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Decks</h1>
          <p className="text-gray-600 mt-2">
            Manage your flashcard collections and track your learning progress
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Import Deck
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Create New Deck
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for deck cards */}
        <div className="bg-white rounded-lg shadow-md p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sample Deck</h3>
          <p className="text-gray-600 text-sm mb-4">A sample flashcard deck to get you started</p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>25 cards</span>
            <span>Last studied: 2 days ago</span>
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between">
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Study Now
            </button>
            <button className="text-gray-600 hover:text-gray-800">
              Edit
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl text-gray-400">+</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Create Your First Deck</h3>
          <p className="text-gray-600 text-sm mb-4">
            Start building your personalized learning experience
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}