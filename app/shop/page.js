'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '../../components/Navbar'
import { Footer } from '../../components/Footer'
import { FiShoppingCart, FiFilter, FiStar, FiChevronDown, FiGrid, FiList } from 'react-icons/fi'

// Mock data for products - in production, this would come from Supabase or an e-commerce backend
const productCategories = [
  { id: 'all', name: 'All Products' },
  { id: 'curriculum', name: 'Curriculum Materials' },
  { id: 'equipment', name: 'Yoga Equipment' },
  { id: 'books', name: 'Books & Guides' },
  { id: 'apparel', name: 'Teacher Apparel' },
  { id: 'accessories', name: 'Classroom Accessories' }
]

const products = [
  {
    id,
    name: 'Yoga for PE: Complete Curriculum Guide',
    description: 'A comprehensive 36-week curriculum for integrating yoga into physical education for grades K-12.',
    price,
    rating,
    reviewCount,
    category: 'curriculum',
    images: ['/images/product-1.jpg', '/images/product-1b.jpg'],
    featured,
    inStock,
    bestSeller,
  {
    id,
    name: 'Classroom Yoga Cards (Set of 40)',
    description: 'Illustrated yoga pose cards perfect for class instruction, with modifications for different ability levels.',
    price,
    rating,
    reviewCount,
    category: 'curriculum',
    images: ['/images/product-2.jpg'],
    featured,
    inStock,
    bestSeller,
  {
    id,
    name: 'Premium Yoga Mats (Set of 10)',
    description: 'Durable, non-slip yoga mats perfect for classroom use. Easy to clean and store.',
    price,
    rating,
    reviewCount,
    category: 'equipment',
    images: ['/images/product-3.jpg'],
    featured,
    inStock,
    bestSeller,
  {
    id,
    name: 'Mindfulness, Moments: PE Teacher\'s Guide',
    description: 'A practical guide for incorporating brief mindfulness activities into any physical education class.',
    price,
    rating,
    reviewCount,
    category: 'books',
    images: ['/images/product-4.jpg'],
    featured,
    inStock,
    bestSeller,
  {
    id,
    name: 'Yoga for PE Teacher Polo Shirt',
    description: 'Comfortable, breathable polo shirt perfect for teaching. Features the Yoga for PE logo.',
    price,
    rating,
    reviewCount,
    category: 'apparel',
    images: ['/images/product-5.jpg'],
    featured,
    inStock,
    bestSeller,
  {
    id,
    name: 'Classroom Focus Timer',
    description: 'Visual timer designed for yoga and mindfulness activities in the classroom setting.',
    price,
    rating,
    reviewCount,
    category: 'accessories',
    images: ['/images/product-6.jpg'],
    featured,
    inStock,
    bestSeller,
  {
    id,
    name: 'Yoga Pose Assessment Rubrics',
    description: 'Comprehensive assessment tools for evaluating student progress in yoga practice.',
    price,
    rating,
    reviewCount,
    category: 'curriculum',
    images: ['/images/product-7.jpg'],
    featured,
    inStock,
    bestSeller,
  {
    id,
    name: 'Breathing Exercise Posters (Set of 5)',
    description: 'Colorful posters illustrating different breathing techniques for classroom use.',
    price,
    rating,
    reviewCount,
    category: 'curriculum',
    images: ['/images/product-8.jpg'],
    featured,
    inStock,
    bestSeller: false
  }
]

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewType, setViewType] = useState('grid') // 'grid' or 'list'
  const [sortOption, setSortOption] = useState('featured')
  const [cart, setCart] = useState([])
  
  // Filter products based on category
  const filteredProducts = products.filter(product => {
    return selectedCategory === 'all' || product.category === selectedCategory
  })
  
  // Sort products based on selection
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'featured') {
      return (a.featured === b.featured) ? 0 : a.featured ? -1 : 1
    } else if (sortOption === 'priceLow') {
      return a.price - b.price
    } else if (sortOption === 'priceHigh') {
      return b.price - a.price
    } else if (sortOption === 'rating') {
      return b.rating - a.rating
    }
    return 0
  })
  
  // Add product to cart
  const addToCart = (productId) => {
    const existingItem = cart.find(item => item.id === productId)
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: item.quantity + 1 } 
          ))
    } else: {
      setCart([...cart, { id, quantity)
    }
  }
  
  // Get total cart items
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)
  
  return (
    <>
      <Navbar />
      
      <main>
        {/* Shop Hero Section */}
        <section className="bg-gradient-to-r from-primary-800 to-primary-900 text-white py-12">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Yoga for PE Shop
            <p className="text-xl max-w-2xl">
              Discover curriculum materials, equipment, books, and more to enhance your yoga in physical education practice.
            </p>
          </div>
        </section>
        
        {/* Mini Cart Notification */}
        {cartItemsCount > 0 && (
          <div className="bg-green-100 border-b border-green-200 py-3">
            <div className="container">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FiShoppingCart className="text-green-600 mr-2" />
                  <span className="text-green-800">
                    <strong>{cartItemsCount}</strong> {cartItemsCount === 1 ? 'item' : 'items'} in your cart
                  </span>
                </div>
                <Link href="/shop/cart" className="text-primary-600 hover:text-primary-700 font-medium">
                  View Cart
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* Shop Controls */}
        <section className="bg-white py-6 border-b">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              {/* Category Filter */}
              <div className="flex items-center">
                <span className="mr-2 text-gray-700">Category:</span>
                <select 
                  className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {productCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Sort and View Controls */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="mr-2 text-gray-700">Sort by:</span>
                  <select
                    className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="featured">Featured
                    <option value="priceLow">Price: Low to High
                    <option value="priceHigh">Price: High to Low
                    <option value="rating">Customer Rating
                  </select>
                </div>
                
                <div className="flex border rounded-lg overflow-hidden">
                  <button
                    className={`p-2 ${viewType === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
                    onClick={() => setViewType('grid')}
                    aria-label="Grid view"
                  >
                    <FiGrid />
                  </button>
                  <button
                    className={`p-2 ${viewType === 'list' ? 'bg-gray-100' : 'bg-white'}`}
                    onClick={() => setViewType('list')}
                    aria-label="List view"
                  >
                    <FiList />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Products */}
        {selectedCategory === 'all' && (
          <section className="py-12 bg-gray-50">
            <div className="container">
              <h2 className="text-2xl font-bold mb-8">Featured Products
              
              <div className="grid md:grid-cols-2 gap-8">
                {products
                  .filter(product => product.featured)
                  .map(product => (
                    <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-lg flex flex-col md:flex-row h-full">
                      <div className="md:w-2/5 h-48 md:h-auto bg-gray-200 relative">
                        {/* This would be the product image */}
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-medium">
                          Product Image
                        </div>
                        {product.bestSeller && (
                          <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            Best Seller
                          </div>
                        )}
                      </div>
                      <div className="p-6 md:w-3/5 flex flex-col">
                        <div className="flex items-center mb-2">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={i < Math.floor(product.rating) ? 'fill-current' : ''}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 ml-2">
                            ({product.reviewCount} reviews)
                          </span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                        <p className="text-gray-600 mb-4 flex-grow">{product.description}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-xl font-bold text-gray-800">${product.price.toFixed(2)}</span>
                          <button
                            className={`btn ${product.inStock ? 'btn-primary' : 'btn-disabled'}`}
                            onClick={() => product.inStock && addToCart(product.id)}
                            disabled={!product.inStock}
                          >
                            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}
        
        {/* Product Listing */}
        <section className="py-12 bg-gray-50">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8">
              {selectedCategory === 'all' 
                ? 'All Products' 
                : productCategories.find(cat => cat.id === selectedCategory)?.name}
            </h2>
            
            {sortedProducts.length > 0 ? (
              viewType === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedProducts.map(product => (
                    <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
                      <div className="h-48 bg-gray-200 relative">
                        {/* This would be the product image */}
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                          Product Image
                        </div>
                        {product.bestSeller && (
                          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            Best Seller
                          </div>
                        )}
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                            <span className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm font-medium">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-grow">
                        <div className="flex items-center mb-1">
                          <div className="flex text-yellow-400 text-sm">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                size={14}
                                className={i < Math.floor(product.rating) ? 'fill-current' : ''}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-1">
                            ({product.reviewCount})
                          </span>
                        </div>
                        <h3 className="font-bold text-lg mb-1 hover:text-primary-600 transition-colors">
                          <Link href={`/shop/product/${product.id}`}>
                            {product.name}
                          </Link>
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                      </div>
                      <div className="p-4 pt-0 mt-auto">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-800">${product.price.toFixed(2)}</span>
                          <button
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              product.inStock 
                                ? 'bg-primary-600 text-white hover:bg-primary-700' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            onClick={() => product.inStock && addToCart(product.id)}
                            disabled={!product.inStock}
                          >
                            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedProducts.map(product => (
                    <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 h-48 md:h-auto bg-gray-200 relative">
                          {/* This would be the product image */}
                          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                            Product Image
                          </div>
                          {product.bestSeller && (
                            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              Best Seller
                            </div>
                          )}
                        </div>
                        <div className="p-6 md:w-3/4">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                            <div className="mb-4 md:mb-0">
                              <div className="flex items-center mb-1">
                                <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <FiStar
                                      key={i}
                                      className={i < Math.floor(product.rating) ? 'fill-current' : ''}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500 ml-2">
                                  ({product.reviewCount} reviews)
                                </span>
                              </div>
                              <h3 className="text-xl font-bold mb-2 hover:text-primary-600 transition-colors">
                                <Link href={`/shop/product/${product.id}`}>
                                  {product.name}
                                </Link>
                              </h3>
                              <p className="text-gray-600">{product.description}</p>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xl font-bold text-gray-800 mb-2">
                                ${product.price.toFixed(2)}
                              </span>
                              <div className="flex space-x-2">
                                <Link 
                                  href={`/shop/product/${product.id}`}
                                  className="px-3 py-1 border border-primary-600 text-primary-600 rounded hover:bg-primary-50 text-sm font-medium"
                                >
                                  View Details
                                </Link>
                                <button
                                  className={`px-3 py-1 rounded text-sm font-medium ${
                                    product.inStock 
                                      ? 'bg-primary-600 text-white hover:bg-primary-700' 
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  }`}
                                  onClick={() => product.inStock && addToCart(product.id)}
                                  disabled={!product.inStock}
                                >
                                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No products found
                <p className="text-gray-600">Try selecting a different category
              </div>
            )}
          </div>
        </section>
        
        {/* Shop by Category Section */}
        {selectedCategory === 'all' && (
          <section className="py-12 bg-white">
            <div className="container">
              <h2 className="text-2xl font-bold mb-8">Shop by Category
              
              <div className="grid md:grid-cols-3 gap-6">
                {productCategories.slice(1).map(category => (
                  <div 
                    key={category.id}
                    className="bg-gray-100 rounded-lg p-6 text-center hover:bg-gray-200 transition-colors cursor-pointer"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-primary-600 text-2xl font-bold">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{category.name}</h3>
                    <p className="text-gray-600 text-sm">
                      Browse our selection of: {category.name.toLowerCase()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        
        {/* Bulk Order CTA */}
        <section className="py-16 bg-primary-50">
          <div className="container">
            <div className="md:flex items-center justify-between bg-white p-8 rounded-xl shadow-md">
              <div className="md:w-2/3 mb-6 md:mb-0">
                <h2 className="text-2xl font-bold mb-3">School & District Orders
                <p className="text-gray-600">
                  Planning to equip your entire school or district with yoga resources? We offer special bulk pricing, 
                  customized curriculum packages, and professional development opportunities.
                </p>
              </div>
              <div className="md:w-1/3 md:text-right">
                <Link href="/shop/bulk-orders" className="btn btn-primary">
                  Learn About Bulk Orders
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
