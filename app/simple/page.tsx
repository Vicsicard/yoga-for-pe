'use client'

import { useState } from 'react'

export default function SimplePage() {
  const [count, setCount] = useState(0)
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Test Page</h1>
      <p className="mb-4">This is a simplified page to test rendering.</p>
      
      <div className="mb-4">
        <p>Count: {count}</p>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setCount(count + 1)}
        >
          Increment
        </button>
      </div>
    </div>
  )
}
