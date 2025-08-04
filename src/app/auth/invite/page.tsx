import Link from 'next/link';

export default function AcceptInvitation() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to breaddie!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your invitation has been accepted successfully.
          </p>
        </div>
        <div className="rounded-md shadow-sm space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Invitation accepted</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    You now have access to your breaddie account. Start exploring recipes, saving
                    your favorites, and sharing your own culinary creations!
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <Link
              href="/recipes"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              Explore Recipes
            </Link>
            <Link
              href="/account"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
