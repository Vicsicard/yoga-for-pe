'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '../../components/Navbar'
import { Footer } from '../../components/Footer'
import { FiSearch, FiClock, FiUser, FiTag } from 'react-icons/fi'

// Mock data for blogs - in production, this would come from Supabase
const blogCategories = [
  { id: 'all', name: 'All Posts' },
  { id: 'teaching-tips', name: 'Teaching Tips' },
  { id: 'research', name: 'Research & Studies' },
  { id: 'case-studies', name: 'Case Studies' },
  { id: 'classroom-activities', name: 'Classroom Activities' },
  { id: 'wellness', name: 'Teacher Wellness' }
]

const blogPosts = [
  {
    id: 1,
    title: 'Incorporating Yoga into Elementary PE: A Comprehensive Guide',
    excerpt: 'Learn how to integrate yoga into your elementary school PE curriculum with age-appropriate poses and activities.',
    author: 'Jane Smith',
    authorRole: 'PE Specialist',
    publishDate: '2025-02-15',
    readTime: '8 min read',
    category: 'Teaching Tips',
    tags: ['elementary', 'curriculum', 'beginners'],
    featuredImage: '/images/blog-1.jpg',
    slug: 'yoga-elementary-pe-guide'
  },
  {
    id: 2,
    title: 'The Impact of Yoga on Student Focus and Academic Performance',
    excerpt: 'Recent research shows significant improvements in student concentration and test scores after implementing regular yoga practice.',
    author: 'Dr. Michael Johnson',
    authorRole: 'Education Researcher',
    publishDate: '2025-01-28',
    readTime: '12 min read',
    category: 'Research & Studies',
    tags: ['research', 'academic performance', 'focus'],
    featuredImage: '/images/blog-2.jpg',
    slug: 'yoga-student-focus-academic-performance'
  },
  {
    id: 3,
    title: 'Morning Yoga Flows: Start the School Day Right',
    excerpt: 'Five simple yoga sequences that can be completed in just 10 minutes to energize students at the beginning of the school day.',
    author: 'Sarah Williams',
    authorRole: 'Yoga Instructor',
    publishDate: '2025-01-10',
    readTime: '6 min read',
    category: 'Classroom Activities',
    tags: ['morning routine', 'quick flows', 'energy'],
    featuredImage: '/images/blog-3.jpg',
    slug: 'morning-yoga-flows-school'
  },
  {
    id: 4,
    title: 'Success Story: How Riverdale High Transformed Their PE Program with Yoga',
    excerpt: 'A case study on how one high school increased student participation and improved classroom behavior by incorporating yoga.',
    author: 'Robert Chen',
    authorRole: 'PE Department Head',
    publishDate: '2024-12-15',
    readTime: '10 min read',
    category: 'Case Studies',
    tags: ['high school', 'case study', 'program implementation'],
    featuredImage: '/images/blog-4.jpg',
    slug: 'riverdale-high-yoga-case-study'
  },
  {
    id: 5,
    title: 'Yoga for Teachers: Preventing Burnout and Maintaining Energy',
    excerpt: 'Self-care practices for educators to stay energized and avoid burnout throughout the school year.',
    author: 'Emily Parker',
    authorRole: 'Wellness Coach',
    publishDate: '2024-11-30',
    readTime: '9 min read',
    category: 'Teacher Wellness',
    tags: ['self-care', 'teacher health', 'stress management'],
    featuredImage: '/images/blog-5.jpg',
    slug: 'yoga-teachers-preventing-burnout'
  },
  {
    id: 6,
    title: 'Adaptive Yoga Poses for Students with Different Abilities',
    excerpt: 'How to modify yoga poses to be inclusive and accessible for all students, regardless of physical abilities.',
    author: 'Alicia Rodriguez',
    authorRole: 'Adaptive PE Specialist',
    publishDate: '2024-11-15',
    readTime: '7 min read',
    category: 'Teaching Tips',
    tags: ['accessibility', 'adaptive poses', 'inclusive education'],
    featuredImage: '/images/blog-6.jpg',
    slug: 'adaptive-yoga-poses-different-abilities'
  }
]

export default function BlogsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filter blogs based on search and category
  const filteredBlogs = blogPosts.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || blog.category === blogCategories.find(c => c.id === selectedCategory)?.name
    
    return matchesSearch && matchesCategory
  })
  
  // Function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }
  
  return (
    <>
      <Navbar />
      
      <main>
        {/* Blog Hero Section */}
        <section className="bg-gradient-to-r from-primary-800 to-primary-900 text-white py-12">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Yoga for PE Blog</h1>
            <p className="text-xl max-w-2xl">
              Stay updated with the latest research, teaching strategies, and success stories from educators implementing yoga in physical education.
            </p>
          </div>
        </section>
        
        {/* Search and Filter */}
        <section className="bg-white py-6 border-b">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-grow max-w-xl">
                <input
                  type="text"
                  placeholder="Search blog posts..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              
              {/* Category Filter */}
              <div className="flex items-center">
                <span className="mr-2 text-gray-700">Category:</span>
                <select 
                  className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {blogCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Post */}
        {filteredBlogs.length > 0 && (
          <section className="py-12 bg-gray-50">
            <div className="container">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                <div className="md:flex">
                  <div className="md:w-1/2 h-64 md:h-auto relative bg-gray-300">
                    {/* This would be the featured blog image */}
                    <div className="absolute inset-0 flex items-center justify-center text-lg font-medium text-white">
                      Featured Blog Image
                    </div>
                  </div>
                  <div className="md:w-1/2 p-8">
                    <div className="flex items-center mb-4">
                      <span className="text-sm font-medium text-primary-600">{filteredBlogs[0].category}</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{formatDate(filteredBlogs[0].publishDate)}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 hover:text-primary-600 transition-colors">
                      <Link href={`/blogs/${filteredBlogs[0].slug}`}>
                        {filteredBlogs[0].title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 mb-6">
                      {filteredBlogs[0].excerpt}
                    </p>
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium">{filteredBlogs[0].author.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{filteredBlogs[0].author}</p>
                        <p className="text-xs text-gray-500">{filteredBlogs[0].authorRole}</p>
                      </div>
                    </div>
                    <Link 
                      href={`/blogs/${filteredBlogs[0].slug}`}
                      className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700"
                    >
                      Read Full Article
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Blog Grid */}
        <section className="py-12 bg-gray-50">
          <div className="container">
            {filteredBlogs.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Skip the first one if it's shown as featured */}
                {filteredBlogs.slice(1).map(blog => (
                  <article key={blog.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-8px]">
                    <div className="h-48 bg-gray-300 relative">
                      {/* This would be the blog thumbnail */}
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <span>Blog Image</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-3">
                        <span className="text-xs font-medium px-3 py-1 bg-primary-50 text-primary-700 rounded-full">
                          {blog.category}
                        </span>
                        <span className="ml-auto flex items-center text-gray-500 text-sm">
                          <FiClock className="mr-1" size={14} />
                          {blog.readTime}
                        </span>
                      </div>
                      <h3 className="font-bold text-xl mb-2 hover:text-primary-600 transition-colors">
                        <Link href={`/blogs/${blog.slug}`}>
                          {blog.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {blog.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs font-medium">{blog.author.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <div className="ml-2">
                            <p className="text-xs font-medium">{blog.author}</p>
                            <p className="text-xs text-gray-500">{formatDate(blog.publishDate)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No blog posts found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
            
            {/* Pagination */}
            {filteredBlogs.length > 0 && (
              <div className="mt-12 flex justify-center">
                <div className="flex space-x-1">
                  <button className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-4 py-2 border rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                    1
                  </button>
                  <button className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    3
                  </button>
                  <button className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
        
        {/* Newsletter Section */}
        <section className="py-16 bg-primary-50">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
              <p className="text-lg text-gray-700 mb-8">
                Get the latest yoga for PE tips, research, and teaching resources delivered directly to your inbox.
              </p>
              <form className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="flex-grow px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <button type="submit" className="btn btn-primary py-3">
                    Subscribe
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  )
}
