import Link from 'next/link'
import Image from 'next/image'
import { FiHeart, FiArrowRight } from 'react-icons/fi'

const contentBubbles = [
  {
    id: 1,
    title: 'Meditation',
    description: 'Take a breath—you\'ve got this. Whether you\'re teaching or tackling a full day, mindfulness offers simple, science-backed tools to help you feel calmer, more focused, and grounded.',
    longDescription: 'Unlock the power of mindfulness and meditation to reduce stress, sharpen focus, and boost emotional awareness. Like a workout for your brain, it helps you bend the body, brighten the mind, and bloom the soul—becoming a calmer, clearer, and more balanced version of yourself!',
    actionText: 'Try it now',
    imagePath: '/images/meditation.jpg',
    link: '/videos/mindfulness'
  },
  {
    id: 2,
    title: 'Yoga for PE',
    description: 'Bend the body, strengthen the mind, and energize your PE classes with yoga that inspires growth and builds confidence. Watch students build mental and physical strength, boost flexibility, and unlock their full potential—one pose at a time!',
    longDescription: 'Bend the body, brighten the mind, and bloom the soul in your PE classes! Explore adaptable yoga poses and sequences for all skill levels, helping students build strength, flexibility, and focus—while making the experience fun and uplifting.',
    actionText: 'Start today',
    imagePath: '/images/yoga-for-pe.jpg',
    link: '/videos/yoga-for-pe'
  },
  {
    id: 3,
    title: 'Relaxation',
    description: 'Relax and recharge with science-backed techniques that calm the mind and relax the body. These practices reduce stress, balance hormones, and promote well-being, allowing your soul to bloom with balance and mental clarity.',
    longDescription: 'Relax and recharge with science-backed techniques that calm the mind and relax the body. These practices reduce stress, balance hormones, and promote well-being, allowing your soul to bloom with balance and mental clarity.',
    actionText: 'Begin your relaxation journey',
    imagePath: '/images/relaxation.jpg',
    link: '/videos/relaxation'
  }
]

export function FeaturedPrograms() {
  return (
    <section className="py-16 bg-white">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-4">Bend, Brighten, Bloom: Yoga for PE & Everybody</h2>
        <p className="text-center text-lg text-gray-600 mb-12 max-w-3xl mx-auto">Bend the body, brighten the mind, and bloom the soul</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {contentBubbles.map((bubble) => (
            <div key={bubble.id} className="card group rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="relative h-60 overflow-hidden rounded-t-lg">
                {/* This is a placeholder - you'll need to add actual images */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white">
                  <span className="text-xl font-medium">{bubble.title}</span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2">{bubble.title}</h3>
                <p className="text-gray-600 mb-6">{bubble.description}</p>
                <Link href={bubble.link} className="inline-flex items-center text-primary-600 font-medium">
                  {bubble.actionText} <FiArrowRight className="ml-2" />
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/videos" className="btn btn-primary inline-flex items-center">
            Explore All Content <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  )
}
