import Link from 'next/link'
import Image from 'next/image'
import { FiHeart } from 'react-icons/fi'

const programs = [
  {
    id: 1,
    title: 'Beginner Package',
    description: 'Perfect for introducing yoga basics in PE classes',
    price: '$49.95',
    imagePath: '/images/beginner-program.jpg',
    link: '/programs/beginner'
  },
  {
    id: 2,
    title: 'Intermediate Package',
    description: 'Advance your students\' yoga journey with more complex poses',
    price: '$79.00',
    imagePath: '/images/intermediate-program.jpg',
    link: '/programs/intermediate'
  },
  {
    id: 3,
    title: 'Advanced Package',
    description: 'Comprehensive yoga curriculum for experienced practitioners',
    price: '$99.00',
    imagePath: '/images/advanced-program.jpg',
    link: '/programs/advanced'
  }
]

export function FeaturedPrograms() {
  return (
    <section className="py-16 bg-white">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Programs</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program) => (
            <div key={program.id} className="card group">
              <div className="relative h-60 overflow-hidden">
                {/* This is a placeholder - you'll need to add actual images */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white">
                  <span className="text-xl font-medium">{program.title} Image</span>
                </div>
                <span className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {program.price}
                </span>
                <button className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all">
                  <FiHeart className="text-gray-400 hover:text-red-500" />
                </button>
              </div>
              
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2">{program.title}</h3>
                <p className="text-gray-600 mb-4">{program.description}</p>
                <Link href={program.link} className="btn btn-secondary w-full">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/programs" className="btn btn-primary">
            View All Programs
          </Link>
        </div>
      </div>
    </section>
  )
}
