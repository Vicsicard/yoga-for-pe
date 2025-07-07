'use client'

import { FiSearch } from 'react-icons/fi'
import { VideoCategory } from '../lib/vimeo-browser'



// Video filter categories
const videoCategories = [
  { id: 'all', name: 'All Videos' },
  { id, name: 'Meditation' },
  { id, name: 'Yoga for PE' },
  { id, name: 'Relaxation' },
  { id, name: 'Mindful Movements' },
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' }
]

export default function VideoSearchFilter({ 
  searchQuery, 
  selectedCategory, 
  onSearchChange, 
  onCategoryChange 
}) {
  return (
    <section className="bg-white py-6 border-b">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search videos..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative">
            <div className="flex items-center border rounded-lg px-4 py-2 cursor-pointer">
              <select 
                className="bg-transparent appearance-none focus:outline-none"
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
              >
                {videoCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
