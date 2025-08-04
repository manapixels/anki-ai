import Link from 'next/link';

export default function EmailChangeConfirmation() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Email Updated</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your email address has been successfully updated.
          </p>
        </div>
        <div className="rounded-md shadow-sm space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Email change confirmed</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Your new email address is now active and you can use it to sign in to your
                    account.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <Link
              href="/account"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              Go to Account Settings
            </Link>
            <Link
              href="/recipes"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse Recipes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
