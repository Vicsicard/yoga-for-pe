import Image from 'next/image'
import { Hero } from '../components/ui/Hero'
import { Section, SectionHeader } from '../components/ui/Section'
import { Button } from '../components/ui/Button'
import { Card, CardImage, CardContent, CardTitle, CardDescription, CardFooter } from '../components/ui/Card'
import { Container } from '../components/ui/Container'
import { TestimonialCard, TestimonialGrid } from '../components/ui/Testimonial'
import { Feature, FeatureGrid, FeatureWithImage } from '../components/ui/Features'
import { FiUsers, FiAward, FiHeart, FiBook, FiCheckCircle, FiArrowRight } from 'react-icons/fi'

// Mock data for featured programs
const featuredPrograms = [
  {
    id: 1,
    title: 'Meditation',
    description: 'Discover the power of mindfulness and meditation techniques designed to help students reduce stress, improve focus, and develop emotional awareness.',
    image: '/images/elementary-yoga (2).jpg',
    url: '/videos/meditation',
    featured: true
  },
  {
    id: 2,
    title: 'Yoga for PE',
    description: 'A comprehensive approach to integrating yoga into physical education classes, featuring adaptable poses and sequences suitable for all skill levels.',
    image: '/images/middle-school-yoga (2).JPG',
    url: '/videos/yoga-for-pe',
    featured: true
  },
  {
    id: 3,
    title: 'Athletic Yoga',
    description: 'Enhance athletic performance through specialized yoga sequences that improve flexibility, strength, balance, and mental focus for sports excellence.',
    image: '/images/high-school-yoga (2).JPG',
    url: '/videos/athletic-performance',
    featured: true
  }
]

// Mock data for benefits
const benefits = [
  {
    id: 1,
    title: 'Improved Focus & Concentration',
    description: 'Research shows that regular yoga practice can significantly improve student attention spans and classroom focus.',
    icon: <FiCheckCircle className="w-full h-full p-2" />
  },
  {
    id: 2,
    title: 'Stress & Anxiety Reduction',
    description: 'Yoga techniques provide students with lifelong tools to manage stress and regulate emotions in healthy ways.',
    icon: <FiHeart className="w-full h-full p-2" />
  },
  {
    id: 3,
    title: 'Enhanced Physical Fitness',
    description: 'Improve strength, flexibility, balance and coordination through age-appropriate yoga poses and sequences.',
    icon: <FiUsers className="w-full h-full p-2" />
  },
  {
    id: 4,
    title: 'Standards-Aligned Curriculum',
    description: 'Our programs align with national PE standards while incorporating cross-curricular connections to other subjects.',
    icon: <FiBook className="w-full h-full p-2" />
  },
  {
    id: 5,
    title: 'Inclusive for All Abilities',
    description: 'Modifications and adaptations ensure every student can participate successfully regardless of physical ability.',
    icon: <FiUsers className="w-full h-full p-2" />
  },
  {
    id: 6,
    title: 'Professional Development',
    description: 'Comprehensive training and support for PE teachers to implement yoga with confidence and expertise.',
    icon: <FiAward className="w-full h-full p-2" />
  }
]

// Mock data for testimonials
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

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <Hero
        title="Transform Your PE Program with Yoga"
        description="Research-backed yoga resources designed specifically for physical education classes. Enhance focus, improve wellness, and bring mindfulness to your PE curriculum."
        buttons={{
          primary: {
            text: "View Our Programs",
            href: "/shop"
          },
          secondary: {
            text: "Watch Demo",
            href: "/videos/demo"
          }
        }}
        size="lg"
        align="center"
        backgroundImage="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1920&auto=format&fit=crop"
        overlayOpacity="medium"
      />
      
      {/* Featured Programs */}
      <Section spacing="xl">
        <SectionHeader
          title="Featured Programs"
          description="Complete curriculum resources for yoga in physical education"
          align="center"
        />
        
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {featuredPrograms.map(program => (
            <Card key={program.id} hover={true}>
              <CardImage aspectRatio="video">
                <img 
                  src={program.image} 
                  alt={program.title}
                  className="w-full h-full object-cover"
                />
              </CardImage>
              <CardContent>
                <CardTitle>{program.title}</CardTitle>
                <CardDescription>{program.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button href={program.url} fullWidth={true}>
                  View Program
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Button href="/shop" variant="outline">
            View All Programs
          </Button>
        </div>
      </Section>
      
      {/* Benefits Section */}
      <Section>
        <SectionHeader
          title="Why Include Yoga in Physical Education?"
          description="Evidence-based benefits for students of all ages"
          align="center"
        />
        
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
          title="Simple to Implement in Any PE Program"
          description="Our comprehensive resources make it easy to introduce yoga, regardless of your previous experience."
          features={[
            {
              id: 1,
              title: "Step-by-Step Lesson Plans",
              description: "Detailed, ready-to-use plans that require minimal preparation time."
            },
            {
              id: 2,
              title: "Video Demonstrations",
              description: "High-quality videos showing every pose and sequence with proper form."
            },
            {
              id: 3,
              title: "Assessment Tools",
              description: "Standards-aligned rubrics and assessment materials included."
            }
          ]}
          imageSrc="/images/yoga-instruction (2).jpg"
          imageAlt="Teacher leading yoga class"
        />
      </Section>
      
      {/* Testimonials */}
      <Section spacing="lg">
        <SectionHeader
          title="What PE Teachers Are Saying"
          align="center"
        />
        
        <TestimonialGrid
          testimonials={testimonials}
          columns={3}
          className="mt-12"
        />
      </Section>
      
      {/* CTA Section */}
      <Section bgColor="dark" spacing="lg">
        <Container size="sm">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your PE Curriculum?</h2>
            <p className="text-lg text-white/80 mb-8">
              Join thousands of schools already enhancing their physical education programs with yoga.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/shop" size="lg">
                Browse Programs
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
