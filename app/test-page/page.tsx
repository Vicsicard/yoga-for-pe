'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [loaded, setLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    console.log('Test page loaded successfully');
    setLoaded(true);
    setCurrentTime(new Date().toISOString());
    
    // Log to server console as well
    try {
      fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Test page loaded' })
      }).catch(err => console.error('Fetch error:', err));
    } catch (error) {
      console.error('Error in fetch:', error);
    }
  }, []);

  return (
    <div className="container mx-auto p-6 bg-yellow-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Test Page - VERY VISIBLE</h1>
      <p className="text-xl mb-2">This is a simple test page to verify rendering and console logging.</p>
      <p className="text-xl mb-4">Check your browser console for a log message.</p>
      <div className="p-4 bg-green-200 rounded-lg">
        <p className="font-bold">Page loaded state: {loaded ? 'YES' : 'NO'}</p>
        {/* Only show time when it's been set client-side */}
        <p>Current time: {currentTime}</p>
      </div>
    </div>
  );
}
