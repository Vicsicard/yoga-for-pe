'use client'

import Image from 'next/image'
import { Hero } from '../components/ui/Hero'
import { Section, SectionHeader } from '../components/ui/Section'
import { Button } from '../components/ui/Button'
import { HeroSlider, HeroSliderContent } from '../components/ui/HeroSlider'
import { Card, CardImage, CardContent, CardTitle, CardDescription, CardFooter } from '../components/ui/Card'
import { Container } from '../components/ui/Container'
import { TestimonialCard, TestimonialGrid } from '../components/ui/Testimonial'
import { Feature, FeatureGrid, FeatureWithImage } from '../components/ui/Features'
import { FiUsers, FiAward, FiHeart, FiBook, FiCheckCircle, FiArrowRight, FiPlay } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { getFeaturedFreeVideos, Video, SubscriptionTier, VideoCategory } from '../lib/vimeo-browser'
import Link from 'next/link'
import FeaturedVideos from '../components/FeaturedVideosNew'

// Content bubbles for Bend, Brighten, Bloom section
const contentBubbles = [
  {
    id: 1,
    title: 'Yoga for PE',
    description: 'Bend the body, strengthen the mind, and energize your PE classes with yoga that inspires growth and builds confidence. Watch students build mental and physical strength, boost flexibility, and unlock their full potential—one pose at a time!',
    longDescription: 'Bend the body, brighten the mind, and bloom the soul in your PE classes! Explore adaptable yoga poses and sequences for all skill levels, helping students build strength, flexibility, and focus—while making the experience fun and uplifting.',
    actionText: 'Start today',
    url: '/videos?category=yoga-for-pe',
    image: '/images/yoga-for-pe.jpg'
  },
  {
    id: 2,
    title: 'Relaxation',
    description: 'Relax and recharge with science-backed techniques that calm the mind and relax the body. These practices reduce stress, balance hormones, and promote well-being, allowing your soul to bloom with balance and mental clarity.',
    longDescription: 'Relax and recharge with science-backed techniques that calm the mind and relax the body. These practices reduce stress, balance hormones, and promote well-being, allowing your soul to bloom with balance and mental clarity.',
    actionText: 'Begin your relaxation journey',
    url: '/videos?category=relaxation',
    image: '/images/relaxation.jpg'
  },
  {
    id: 3,
    title: 'Meditation',
    description: 'Take a breath—you\'ve got this. Whether you\'re teaching or tackling a full day, mindfulness offers simple, science-backed tools to help you feel calmer, more focused, and grounded.',
    longDescription: 'Unlock the power of mindfulness and meditation to reduce stress, sharpen focus, and boost emotional awareness. Like a workout for your brain, it helps you bend the body, brighten the mind, and bloom the soul—becoming a calmer, clearer, and more balanced version of yourself!',
    actionText: 'Try it now',
    url: '/videos?category=meditation',
    image: '/images/meditation.jpg'
  }
]

// Updated data for benefits with alignment to SHAPE America standards
const benefits = [
  {
    id: 1,
    title: 'Improved Focus & Concentration',
    description: 'Research shows that regular yoga practice can significantly improve student attention spans and classroom focus.',
    longDescription: 'Research shows that regular yoga practice can significantly improve student attention spans and classroom focus. Through controlled breathing, mindfulness, and intentional movement, yoga teaches students how to calm their minds and stay present. This translates to better concentration not only during PE but also in academic classes. Students who regularly practice yoga often show improved cognitive function, emotional regulation, and the ability to stay on task—all crucial skills for learning and development.',
    standardsAlignment: 'Aligns with Standard 2: Applies knowledge of concepts, principles, strategies, and tactics related to movement and performance. Yoga introduces students to concepts of body awareness, balance, and movement control.',
    icon: <FiCheckCircle className="w-full h-full p-2" />
  },
  {
    id: 2,
    title: 'Stress & Anxiety Reduction',
    description: 'Yoga techniques provide students with lifelong tools to manage stress and regulate emotions in healthy ways.',
    longDescription: 'Yoga techniques provide students with lifelong tools to manage stress and regulate emotions in healthy ways. Through breathing exercises, mindfulness, and gentle movement, yoga promotes a calm nervous system and greater emotional resilience—skills students can apply in both school and life.',
    standardsAlignment: 'Aligns with Standard 3: Demonstrates the knowledge and skills to achieve and maintain a health-enhancing level of physical activity and fitness. Students develop self-regulation techniques and stress-reduction strategies that contribute to lifelong wellness.',
    icon: <FiHeart className="w-full h-full p-2" />
  },
  {
    id: 3,
    title: 'Enhanced Physical Fitness',
    description: 'Improve strength, flexibility, balance, and coordination through age-appropriate yoga poses and sequences.',
    longDescription: 'Improve strength, flexibility, balance, and coordination through age-appropriate yoga poses and sequences. Yoga builds muscular endurance, enhances joint mobility, and improves motor skills—all of which support physical literacy across a variety of activities and sports.',
    standardsAlignment: 'Aligns with Standard 1: Demonstrates competency in a variety of motor skills and movement patterns. Yoga develops motor skills like balance, coordination, and controlled movement.',
    icon: <FiUsers className="w-full h-full p-2" />
  },
  {
    id: 4,
    title: 'Standards-Aligned Curriculum',
    description: 'Our programs align with the 2024 SHAPE America National Physical Education Standards while supporting cross-curricular connections.',
    longDescription: 'Yoga fits beautifully into a well-rounded PE curriculum by supporting physical literacy and the development of social-emotional skills, cognitive understanding, and lifelong wellness habits. Our curriculum is specifically designed to meet the 2024 SHAPE America National Physical Education Standards.',
    standardsAlignment: 'Comprehensive alignment with all five 2024 SHAPE America standards, ensuring your program meets national benchmarks.',
    icon: <FiBook className="w-full h-full p-2" />
  },
  {
    id: 5,
    title: 'Inclusive for All Abilities',
    description: 'Yoga provides equitable opportunities through modifications and adaptations so all students can engage meaningfully and successfully.',
    longDescription: 'Yoga provides equitable opportunities by incorporating modifications and adaptations so that all students, regardless of ability, can engage meaningfully and successfully in physical activity.',
    standardsAlignment: 'Aligns with Standard 4: Exhibits responsible personal and social behavior that respects self and others. A yoga environment fosters mindfulness, respect, and calm.',
    icon: <FiUsers className="w-full h-full p-2" />
  },
  {
    id: 6,
    title: 'Professional Development',
    description: 'Comprehensive training and support for PE teachers to implement yoga with confidence and expertise.',
    longDescription: 'We offer comprehensive professional development through in-services, guest speaking, curriculum design, and one-on-one consulting/coaching to ensure you can implement yoga with confidence and expertise.',
    standardsAlignment: 'Supports teachers in meeting Standard 5: Recognizes the value of physical activity for health, enjoyment, challenge, self-expression, and social interaction.',
    icon: <FiAward className="w-full h-full p-2" />
  }
]

// Testimonials remain the same
const testimonials = [
  {
    id: 1,
    quote: "Implementing the Yoga for PE curriculum has transformed our physical education program. Students are more engaged and we've seen improvements in focus and behavior.",
    author: "Sarah Johnson",
    title: "PE Teacher, Lincoln Elementary",
    avatar: "https://placehold.co/200x200/e2e8f0/1e293b?text=SJ"
  },
  {
    id: 2,
    quote: "The resources are comprehensive and so easy to follow. Even as someone with no yoga background, I felt confident teaching these lessons from day one.",
    author: "Michael Rodriguez",
    title: "Athletic Director, Washington Middle School",
    avatar: "https://placehold.co/200x200/e2e8f0/1e293b?text=MR"
  },
  {
    id: 3,
    quote: "Our students ask for yoga days! The program has been especially helpful for our athletes in preventing injuries and improving mind-body awareness.",
    author: "Jennifer Lee",
    title: "High School PE Department Chair",
    avatar: "https://placehold.co/200x200/e2e8f0/1e293b?text=JL"
  }
]

// Our mission content
const missionContent = {
  title: "Our Mission",
  description: "Yoga For PE & Everybody is dedicated to empowering individuals of all ages through a wholistic approach to movement, mindfulness, and education. Our mission is to inspire educators, students, and lifelong learners to bend the body, brighten the mind, and bloom the soul creating a strong foundation for lifelong well-being.",
  extendedDescription: "We believe that true growth happens when we cultivate physical strength, mental clarity, and emotional resilience. Through mindful movement and purposeful practice, we provide the tools and guidance to help individuals thrive—whether in the classroom, at home, or in everyday life. We aim to nurture a lifetime of personal growth, joy, and empowerment, one movement at a time."
}

export default function Home() {
  // State for featured videos and loading
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fallback videos in case the API calls fail - ordered as requested: Yoga for PE first, Relaxation second, Meditation third
  const fallbackVideos: Video[] = [
    {
      id: 1095788590,
      title: 'Ab Circle 1',
      description: 'A fun, full-circle core workout that targets every major ab muscle in one dynamic loop.',
      duration: '1:30',
      level: 'Beginner',
      thumbnail: 'https://i.vimeocdn.com/video/1016790651-4c20aab2a41f4d5a4e5e9c9ec5e9b3b9a1b7c4f4d5e5c4f4d5e5c4f4d5e5c4f4_640',
      vimeoId: '1095788590',
      tier: SubscriptionTier.BRONZE,
      category: VideoCategory.YOGA_FOR_PE
    },
    {
      id: 452426275,
      title: 'Body Scan with Flowers',
      description: 'A relaxing body scan meditation to help you unwind and connect with your body.',
      duration: '1:00',
      level: 'Beginner',
      thumbnail: 'https://i.vimeocdn.com/video/1016790651-4c20aab2a41f4d5a4e5e9c9ec5e9b3b9a1b7c4f4d5e5c4f4d5e5c4f4d5e5c4f4_640',
      vimeoId: '452426275',
      tier: SubscriptionTier.BRONZE,
      category: VideoCategory.RELAXATION
    },
    {
      id: 457053392,
      title: 'I Am Meditation',
      description: 'A guided meditation to help you connect with your inner self and find peace.',
      duration: '1:08',
      level: 'Beginner',
      thumbnail: 'https://i.vimeocdn.com/video/1016790651-4c20aab2a41f4d5a4e5e9c9ec5e9b3b9a1b7c4f4d5e5c4f4d5e5c4f4d5e5c4f4_640',
      vimeoId: '457053392',
      tier: SubscriptionTier.BRONZE,
      category: VideoCategory.MEDITATION
    }
  ];

  // Load featured videos on mount
  useEffect(() => {
    const loadFeaturedVideos = async () => {
      try {
        const videos = await getFeaturedFreeVideos();
        if (videos && videos.length > 0) {
          setFeaturedVideos(videos);
        } else {
          console.log('No videos returned from API, using fallbacks');
          setFeaturedVideos(fallbackVideos);
        }
      } catch (error) {
        console.error('Error loading featured videos:', error);
        setLoadError('Failed to load videos from Vimeo. Using fallback videos instead.');
        setFeaturedVideos(fallbackVideos);
      } finally {
        setIsLoading(false);
      }
    };
    loadFeaturedVideos();
  }, []);
  return (
    <main>
      {/* Hero Section with Image Slider */}
      <HeroSlider height="h-[600px] md:h-[700px]" overlayOpacity="medium" autoplayInterval={6000} pageType="home">
        <HeroSliderContent>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-md">
            Bend the Body, Brighten the Mind, Bloom the Soul
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto drop-shadow-md text-white font-medium">
            Research-backed yoga resources designed specifically for physical education classes, educators, and lifelong learners. Enhance focus, improve wellness, and bring mindfulness to your curriculum and life.
          </p>
          <Button href="/videos" size="lg" className="text-lg px-8 py-3">
            View Our Videos
          </Button>
        </HeroSliderContent>
      </HeroSlider>
      
      {/* Mission Section */}
      <Section spacing="lg">
        <SectionHeader
          title={missionContent.title}
          description={missionContent.description}
          align="center"
        />
        <div className="mt-6 text-center max-w-4xl mx-auto">
          <p className="text-gray-600">{missionContent.extendedDescription}</p>
        </div>
      </Section>
      
      {/* Featured Free Videos Section */}
      <Section bgColor="light" spacing="lg">
        <SectionHeader
          title="Featured Free Videos"
          description="Start your yoga journey with these free videos"
          align="center"
        />
        
        <FeaturedVideos videos={featuredVideos} isLoading={isLoading} />
        
        <div className="text-center mt-8">
          <Button href="/videos" variant="default">
            View All Videos <FiArrowRight className="ml-2" />
          </Button>
        </div>
      </Section>
      
      {/* Benefits Section */}
      <Section bgColor="light">
        <SectionHeader
          title="Why Include Yoga in Physical Education?"
          description="Evidence-based benefits aligned with 2024 SHAPE America National Standards"
          align="center"
        />
        
        <div className="mt-6 mb-10 text-center max-w-4xl mx-auto">
          <p className="text-gray-600">PE teachers should include yoga in their physical education classes for several great reasons that go beyond just flexibility and stretching. Yoga supports the whole student and aligns perfectly with national physical education standards.</p>
        </div>
        
        <FeatureGrid
          features={benefits}
          columns={3}
          variant="cards"
          className="mt-12"
        />
      </Section>
      
      {/* How It Works */}
      <Section bgColor="primary" spacing="lg">
        <FeatureWithImage
          title="Yoga That Fits Your PE Program"
          description="Whether you're a yoga newbie or a seasoned pro, our ready-to-roll resources make it super simple to bring yoga into your class—without the stress."
          features={[
            {
              id: 1,
              title: "Easy-to-Follow Lesson Plans",
              description: "You've got enough on your plate. Our step-by-step plans are designed for busy PE teachers—minimal prep, maximum impact."
            },
            {
              id: 2,
              title: "Clear Video Demonstrations",
              description: "No guesswork here! Each pose and sequence is shown with proper form so you can teach with confidence (or just press play and follow along)."
            },
            {
              id: 3,
              title: "Built-In Assessment Tools",
              description: "Yep, we've got standards-aligned rubrics, reflection sheets, and progress trackers to help you assess without the extra lift."
            },
            {
              id: 4,
              title: "Yoga Made Simple for Lifelong Learners",
              description: "New to yoga? No worries! Our easy-to-use resources make it fun and approachable—no matter your age, background, or experience level."
            }
          ]}
          imagePosition="right"
          imageSrc="/images/high-school-yoga (2).JPG"
          imageAlt="High school students practicing yoga in PE class"
        />
      </Section>
      
      {/* Testimonials */}
      <Section spacing="xl">
        <SectionHeader
          title="What Educators Are Saying"
          description="Hear from teachers who have integrated yoga into their PE curriculum"
          align="center"
        />
        
        <TestimonialGrid testimonials={testimonials} columns={3} className="mt-12" />

        {/* Professional Development Contact Section */}
        <div className="mt-16 bg-white p-8 rounded-lg shadow-sm">
          <h3 className="text-2xl font-bold text-center mb-4">Contact Yoga For PE and Everybody</h3>
          <p className="text-center mb-6">We offer professional development opportunities for educators:</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-white rounded shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-medium mb-2">In-services</h4>
              <p className="text-sm text-gray-600">Specialized training for your school or district</p>
            </div>
            <div className="p-4 bg-white rounded shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-medium mb-2">Guest Speaking</h4>
              <p className="text-sm text-gray-600">Engaging presentations for professional events</p>
            </div>
            <div className="p-4 bg-white rounded shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-medium mb-2">Curriculum Design</h4>
              <p className="text-sm text-gray-600">Custom curriculum development for your specific needs</p>
            </div>
            <div className="p-4 bg-white rounded shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-medium mb-2">One-on-One Consulting</h4>
              <p className="text-sm text-gray-600">Personal training and Group fitness for everyone.</p>
            </div>
          </div>
          <div className="text-center mt-6">
            <Button href="/contact" variant="default">
              Get in Touch
            </Button>
          </div>
        </div>
      </Section>
      
      {/* CTA Section */}
      <Section bgColor="dark" spacing="lg">
        <Container size="sm">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Shake Up Your Fitness Routine?</h2>
            <p className="text-lg text-white/80 mb-8">
              From classrooms to living rooms, join thousands of individuals, educators, and schools on a journey to bend, brighten, and bloom through the power of yoga!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/videos" size="lg">
                View our Videos
              </Button>
              <Button href="/contact" variant="light" size="lg">
                Contact Us
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}
