'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '../../components/Navbar'
import { Footer } from '../../components/Footer'
import { FiMapPin, FiCalendar, FiUser, FiChevronRight, FiImage } from 'react-icons/fi'

// Mock data for travel stories - in production, this would come from Supabase
const travelStories = [
  {
    id,
    title: 'Yoga Retreat in Bali: Bringing Back Mindfulness to PE',
    description: 'Exploring the ancient temples and lush landscapes of Bali while learning traditional yoga practices to incorporate into physical education.',
    location: 'Bali, Indonesia',
    date: '2025-01-15',
    author: 'Maria Rodriguez',
    featuredImage: '/images/travel-bali.jpg',
    imageCount,
    slug: 'yoga-retreat-bali',
    featured,
  {
    id,
    title: 'Teaching Yoga in Remote Mountain Schools of Nepal',
    description: 'A transformative journey bringing yoga education to isolated mountain communities and learning their traditional movement practices.',
    location: 'Himalayas, Nepal',
    date: '2024-11-08',
    author: 'James Wilson',
    featuredImage: '/images/travel-nepal.jpg',
    imageCount,
    slug: 'yoga-teaching-nepal',
    featured,
  {
    id,
    title: 'Yoga Education Conference in Stockholm',
    description: 'Connecting with international educators at the annual Physical Education Innovation Summit to share yoga implementation strategies.',
    location: 'Stockholm, Sweden',
    date: '2024-09-22',
    author: 'Sarah Johnson',
    featuredImage: '/images/travel-stockholm.jpg',
    imageCount,
    slug: 'yoga-conference-stockholm',
    featured,
  {
    id,
    title: 'Ancient Yoga Sites of India: A Teacher\'s Pilgrimage',
    description: 'Exploring the birthplace of yoga and gathering authentic techniques to bring back to Western physical education programs.',
    location: 'Rishikesh, India',
    date: '2024-07-05',
    author: 'Michael Chen',
    featuredImage: '/images/travel-india.jpg',
    imageCount,
    slug: 'yoga-pilgrimage-india',
    featured,
  {
    id,
    title: 'Costa Rica Wellness Retreat for PE Teachers',
    description: 'Leading a group of physical education teachers through a rejuvenating retreat focused on self-care and sustainable teaching practices.',
    location: 'Nosara, Costa Rica',
    date: '2024-05-17',
    author: 'Emily Parker',
    featuredImage: '/images/travel-costa-rica.jpg',
    imageCount,
    slug: 'teacher-retreat-costa-rica',
    featured,
  {
    id,
    title: 'Yoga and Movement Workshops Across Australia',
    description: 'A month-long tour sharing yoga for PE methodologies with schools across Australia\'s diverse educational landscape.',
    location: 'Various Cities, Australia',
    date: '2024-03-10',
    author: 'David Thompson',
    featuredImage: '/images/travel-australia.jpg',
    imageCount,
    slug: 'yoga-workshops-australia',
    featured: false
  }
]

export default function TravelPage() {
  const [activeTab, setActiveTab] = useState('stories')
  
  // Format date function
  const formatDate = (dateString) => {
    const options= { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }
  
  // Get featured stories
  const featuredStories = travelStories.filter(story => story.featured)
  
  return (
    <>
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-800 to-primary-900 text-white py-12">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Yoga Travel Adventures
            <p className="text-xl max-w-2xl">
              Join us on our journey around the world exploring yoga traditions, teaching practices, and bringing global perspectives back to PE classrooms.
            </p>
          </div>
        </section>
        
        {/* Tabs */}
        <section className="bg-white border-b">
          <div className="container">
            <div className="flex overflow-x-auto">
              <button
                className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                  activeTab === 'stories'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('stories')}
              >
                Travel Stories
              </button>
              <button
                className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                  activeTab === 'gallery'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('gallery')}
              >
                Photo Gallery
              </button>
              <button
                className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                  activeTab === 'upcoming'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming Trips
              </button>
            </div>
          </div>
        </section>
        
        {/* Content based on active tab */}
        {activeTab === 'stories' && (
          <>
            {/* Featured Travel Stories */}
            {featuredStories.length > 0 && (
              <section className="py-12 bg-gray-50">
                <div className="container">
                  <h2 className="text-2xl font-bold mb-8">Featured Adventures
                  
                  <div className="grid lg:grid-cols-2 gap-8">
                    {featuredStories.map(story => (
                      <div key={story.id} className="bg-white rounded-xl overflow-hidden shadow-lg flex flex-col h-full">
                        <div className="h-64 bg-gray-300 relative">
                          {/* This would be the featured story image */}
                          <div className="absolute inset-0 flex items-center justify-center text-white font-medium">
                            Travel Story Image
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                            <div className="flex items-center text-white mb-2">
                              <FiMapPin className="mr-1" />
                              <span className="text-sm">{story.location}</span>
                              <span className="mx-2">•</span>
                              <FiCalendar className="mr-1" />
                              <span className="text-sm">{formatDate(story.date)}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white">{story.title}</h3>
                          </div>
                        </div>
                        <div className="p-6 flex-grow">
                          <p className="text-gray-600 mb-4">{story.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xs font-medium">{story.author.split(' ').map(n => n[0]).join('')}</span>
                              </div>
                              <span className="ml-2 text-sm font-medium">{story.author}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <FiImage className="mr-1" />
                              <span>{story.imageCount} photos
                            </div>
                          </div>
                        </div>
                        <div className="px-6 pb-6">
                          <Link 
                            href={`/travel/${story.slug}`}
                            className="btn btn-primary w-full"
                          >
                            Read Adventure
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
            
            {/* All Travel Stories */}
            <section className="py-12 bg-gray-50">
              <div className="container">
                <h2 className="text-2xl font-bold mb-8">All Travel Stories
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {travelStories
                    .filter(story => !story.featured)
                    .map(story => (
                      <div key={story.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-8px]">
                        <div className="h-48 bg-gray-300 relative">
                          {/* This would be the story thumbnail */}
                          <div className="absolute inset-0 flex items-center justify-center text-white">
                            <span>Travel Image
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <FiMapPin className="mr-1" />
                            <span>{story.location}</span>
                            <span className="mx-2">•</span>
                            <FiCalendar className="mr-1" />
                            <span>{formatDate(story.date)}</span>
                          </div>
                          <h3 className="font-bold text-xl mb-2 hover:text-primary-600 transition-colors">
                            <Link href={`/travel/${story.slug}`}>
                              {story.title}
                            </Link>
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {story.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xs font-medium">{story.author.split(' ').map(n => n[0]).join('')}</span>
                              </div>
                              <span className="ml-2 text-sm font-medium">{story.author}</span>
                            </div>
                            <Link 
                              href={`/travel/${story.slug}`}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                            >
                              Read More
                              <FiChevronRight className="ml-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                
                {/* Load More Button */}
                <div className="mt-12 text-center">
                  <button className="btn btn-secondary">
                    Load More Stories
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
        
        {activeTab === 'gallery' && (
          <section className="py-12 bg-gray-50">
            <div className="container">
              <h2 className="text-2xl font-bold mb-8">Photo Gallery: {/* Photo Gallery Filters */}
              <div className="flex flex-wrap gap-2 mb-8">
                <button className="px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-medium">
                  All Photos
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50">
                  Asia
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50">
                  Europe
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50">
                  Americas
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50">
                  Oceania
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50">
                  Africa
                </button>
              </div>
              
              {/* Photo Grid - in a real app, these would be actual images */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length).map((_, index) => (
                  <div 
                    key={index} 
                    className="aspect-square bg-gray-300 rounded-md overflow-hidden cursor-pointer relative group"
                  >
                    {/* This would be the photo */}
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <span>Photo: {index + 1}</span>
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button className="bg-white text-primary-600 p-2 rounded-full">
                        <FiImage size={24} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Load More Button */}
              <div className="mt-12 text-center">
                <button className="btn btn-secondary">
                  Load More Photos
                </button>
              </div>
            </div>
          </section>
        )}
        
        {activeTab === 'upcoming' && (
          <section className="py-12 bg-gray-50">
            <div className="container">
              <h2 className="text-2xl font-bold mb-8">Upcoming Travel Opportunities
              
              <div className="bg-white p-6 md:p-8 rounded-xl shadow-md mb-8">
                <div className="prose max-w-none">
                  <p className="text-lg">
                    Join our yoga education adventures around the world! We offer several types of travel opportunities for physical education professionals:
                  </p>
                  
                  <ul className="mt-4 space-y-2">
                    <li><strong>Teacher Retreats - Rejuvenating experiences focused on self-care and professional development
                    <li><strong>Educational Tours - Visit schools and programs implementing yoga in different cultural contexts
                    <li><strong>Conference Travel - Join us at international PE and yoga education conferences
                    <li><strong>Service Trips - Volunteer to teach yoga in underserved communities worldwide
                  </ul>
                </div>
              </div>
              
              {/* Upcoming Trips */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/3 h-48 md:h-auto bg-gray-300 relative">
                      {/* This would be the trip image */}
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <span>Japan Trip Image
                      </div>
                    </div>
                    <div className="p-6 md:w-2/3">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          Educational Tour
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Professional Development
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Mindfulness in Japanese Education: A Study Tour
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <FiMapPin className="mr-1" />
                        <span>Tokyo, Kyoto, and Okinawa, Japan
                        <span className="mx-2">•</span>
                        <FiCalendar className="mr-1" />
                        <span>June 10-24, 2025
                      </div>
                      <p className="text-gray-600 mb-4">
                        Explore how mindfulness and movement practices are integrated into Japanese education systems, with visits to schools, temples, and traditional dojos. Learn techniques to bring back to your PE classroom.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-gray-700 font-bold">
                          $3,850 <span className="text-sm font-normal text-gray-500">per person
                        </div>
                        <Link href="/travel/upcoming/japan-2025" className="btn btn-primary">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/3 h-48 md:h-auto bg-gray-300 relative">
                      {/* This would be the trip image */}
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <span>Greece Trip Image
                      </div>
                    </div>
                    <div className="p-6 md:w-2/3">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          Teacher Retreat
                        </span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Self-Care
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Greek Islands Yoga Retreat for PE Teachers
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <FiMapPin className="mr-1" />
                        <span>Crete and Santorini, Greece
                        <span className="mx-2">•</span>
                        <FiCalendar className="mr-1" />
                        <span>August 5-15, 2025
                      </div>
                      <p className="text-gray-600 mb-4">
                        Rejuvenate before the new school year with daily yoga, Mediterranean cuisine, and workshops on preventing teacher burnout. Connect with like-minded PE professionals in a beautiful setting.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-gray-700 font-bold">
                          $2,995 <span className="text-sm font-normal text-gray-500">per person
                        </div>
                        <Link href="/travel/upcoming/greece-2025" className="btn btn-primary">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/3 h-48 md:h-auto bg-gray-300 relative">
                      {/* This would be the trip image */}
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <span>Costa Rica Trip Image
                      </div>
                    </div>
                    <div className="p-6 md:w-2/3">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          Service Trip
                        </span>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                          Teaching Opportunity
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Costa Rica Service Learning: Yoga in Rural Schools
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <FiMapPin className="mr-1" />
                        <span>San José and Monteverde, Costa Rica
                        <span className="mx-2">•</span>
                        <FiCalendar className="mr-1" />
                        <span>November 8-18, 2025
                      </div>
                      <p className="text-gray-600 mb-4">
                        Volunteer to bring yoga education to rural Costa Rican schools while immersing yourself in the local culture and rainforest environment. A transformative experience combining service and professional growth.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-gray-700 font-bold">
                          $2,250 <span className="text-sm font-normal text-gray-500">per person
                        </div>
                        <Link href="/travel/upcoming/costa-rica-2025" className="btn btn-primary">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Join Our Community CTA */}
        <section className="py-16 bg-primary-600 text-white">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Join Our Travel Community
              <p className="text-xl mb-8">
                Connect with fellow educators who share your passion for yoga and global education. Share stories, find travel partners, and discover new opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn bg-white text-primary-700 hover:bg-gray-100">
                  Join Community
                </button>
                <Link href="/travel/share-story" className="btn bg-primary-700 text-white hover:bg-primary-800">
                  Share Your Story
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  )
}
