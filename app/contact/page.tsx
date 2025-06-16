import React from 'react';
import { FiMail, FiPhone, FiMapPin, FiUser, FiMessageSquare } from 'react-icons/fi';
import { Container } from '../../components/ui/Container';
import { Section, SectionHeader } from '../../components/ui/Section';
import { Button } from '../../components/ui/Button';
import { HeroSlider, HeroSliderContent } from '../../components/ui/HeroSlider';

export default function ContactPage() {
  return (
    <main>
      {/* Hero Section with Image Slider */}
      <HeroSlider height="h-[400px] md:h-[500px]" overlayOpacity="medium" autoplayInterval={6000} imageSet="contact">
        <HeroSliderContent>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-md">Get in Touch</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto drop-shadow-md text-white font-medium">
            Have questions about bringing yoga to your PE program? We're here to help you bend, brighten, and bloom.
          </p>
        </HeroSliderContent>
      </HeroSlider>

      {/* Contact Form Section */}
      <Section spacing="xl">
        <Container>
          <div className="grid md:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="md:col-span-1">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <FiMail className="text-primary-600 h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-gray-600">hello@yogaforpe.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <FiPhone className="text-primary-600 h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-gray-600">(555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <FiMapPin className="text-primary-600 h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Location</h3>
                    <p className="text-gray-600">Denver, Colorado (Available for travel worldwide)</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="text-xl font-bold mb-4">Professional Development Options</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary-500 mr-2"></div>
                    <span>In-services for schools and districts</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary-500 mr-2"></div>
                    <span>Guest speaking at conferences</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary-500 mr-2"></div>
                    <span>Custom curriculum design</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary-500 mr-2"></div>
                    <span>One-on-one consulting</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiUser className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 p-3"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMail className="text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 p-3"
                          placeholder="johndoe@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 p-3"
                    >
                      <option value="" disabled selected>Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="professional_development">Professional Development</option>
                      <option value="curriculum">Curriculum Questions</option>
                      <option value="videos">Video Content Access</option>
                      <option value="speaking">Speaking Engagement</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <FiMessageSquare className="text-gray-400" />
                      </div>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 p-3"
                        placeholder="Your message here..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="newsletter"
                        name="newsletter"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="newsletter" className="font-medium text-gray-700">
                        Subscribe to our newsletter
                      </label>
                      <p className="text-gray-500">Stay updated with new content, events, and yoga resources.</p>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQ Section */}
      <Section bgColor="light">
        <Container>
          <SectionHeader
            title="Frequently Asked Questions"
            description="Find answers to common questions about our yoga for PE program"
            align="center"
          />

          <div className="max-w-3xl mx-auto mt-10 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">How do I integrate yoga into my existing PE curriculum?</h3>
              <p className="text-gray-600">
                Our resources are designed to complement your existing PE program. You can use our videos as standalone lessons, warm-ups, cool-downs, or integrate yoga poses into your regular activities.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Do I need previous yoga experience to teach these materials?</h3>
              <p className="text-gray-600">
                Not at all! Our content is designed for educators of all experience levels. The videos provide clear instruction that you can follow along with your students.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">How do your resources align with PE standards?</h3>
              <p className="text-gray-600">
                Our yoga program aligns with the 2024 SHAPE America National Physical Education Standards, supporting physical literacy, movement competency, and lifelong wellness habits.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
