'use client';

import { useState, useEffect } from 'react';

export default function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);

  useEffect(() => {
    // Add global error handler
    const errorHandler = (event) => {
      console.error('Global error caught:', event.error);
      setHasError(true);
      setError(event.error);
      // Prevent the default browser error handling
      event.preventDefault();
    };

    // Add unhandled promise rejection handler
    const rejectionHandler = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      setHasError(true);
      setError(event.reason);
      // Prevent the default browser error handling
      event.preventDefault();
    };

    // Register the handlers
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    // Clean up
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  // Reset the error state
  const resetError = () => {
    setHasError(false);
    setError(null);
    setErrorInfo(null);
    window.location.reload();
  };

  if (hasError) {
    // Render fallback UI
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">Something went wrong</h2>
          <div className="mt-4 bg-gray-50 p-4 rounded-md overflow-auto max-h-60">
            <p className="text-sm font-mono text-red-600 whitespace-pre-wrap">
              {error && (error.toString() || 'Unknown error')}
            </p>
            {errorInfo && (
              <p className="text-sm font-mono text-gray-600 mt-2 whitespace-pre-wrap">
                {errorInfo.componentStack}
              </p>
            )}
          </div>
          <div className="mt-6 flex justify-center">
            <button
              onClick={resetError}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If there's no error, render children normally
  return children;
}
