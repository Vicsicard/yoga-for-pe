"use client";

import React, { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiUser, FiMessageSquare } from 'react-icons/fi';
import { Container } from '../../components/ui/Container';
import { Section, SectionHeader } from '../../components/ui/Section';
import { Button } from '../../components/ui/Button';
import { HeroSlider, HeroSliderContent } from '../../components/ui/HeroSlider';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    newsletter: false
  });
  
  const [formStatus, setFormStatus] = useState({
    isSubmitting: false,
    isSubmitted: false,
    isError: false,
    message: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setFormStatus({
      isSubmitting: true,
      isSubmitted: false,
      isError: false,
      message: ""
    });
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }
      
      setFormStatus({
        isSubmitting: false,
        isSubmitted: true,
        isError: false,
        message: data.message || "Your message has been sent successfully!"
      });
      
      // Reset form after successful submission
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        newsletter: false
      });
      
    } catch (error) {
      console.error("Contact form submission error:", error);
      
      setFormStatus({
        isSubmitting: false,
        isSubmitted: true,
        isError: true,
        message: error.message || "Something went wrong. Please try again later."
      });
    }
  };
  return (
    <main>
      {/* Hero Section with Image Slider */}
      <HeroSlider height="h-[400px] md:h-[500px]" overlayOpacity="medium" autoplayInterval={6000} pageType="contact">
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
                    <p className="text-gray-600">720.514.9820</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                    <FiMapPin className="text-primary-600 h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Location</h3>
                    <p className="text-gray-600">Colorado (Available for worldwide travel)</p>
                    <p className="text-gray-600 mt-1">Wholistic Mechanics, INC</p>
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
                {formStatus.isSubmitted && !formStatus.isError ? (
                  <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-700 font-medium">{formStatus.message}</p>
                    <button 
                      onClick={() => setFormStatus(prev => ({ ...prev, isSubmitted: false }))} 
                      className="mt-4 text-sm text-teal-600 hover:text-teal-800 font-medium"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form className="space-y-6 mt-8" onSubmit={handleSubmit}>
                    {formStatus.isSubmitted && formStatus.isError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-700">{formStatus.message}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                      ></textarea>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="newsletter"
                        name="newsletter"
                        type="checkbox"
                        checked={formData.newsletter}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700">
                        Subscribe to our newsletter
                      </label>
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={formStatus.isSubmitting}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400 disabled:cursor-not-allowed"
                      >
                        {formStatus.isSubmitting ? "Sending..." : "Send Message"}
                      </button>
                    </div>
                  </form>
                )}
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

          <div className="max-w-4xl mx-auto mt-10 space-y-8">
            <div className="p-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-2xl" style={{ background: 'linear-gradient(135deg, #1B90A4, #167A8C)' }}>
              <h3 className="text-xl font-bold text-white mb-4 drop-shadow-sm">How do I integrate yoga into my existing PE curriculum?</h3>
              <p className="text-white/90 leading-relaxed text-base">
                Our resources are designed to complement your existing PE program. You can use our videos as standalone lessons, warm-ups, cool-downs, or integrate yoga poses into your regular activities.
              </p>
            </div>

            <div className="p-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-2xl" style={{ background: 'linear-gradient(135deg, #167A8C, #1B90A4)' }}>
              <h3 className="text-xl font-bold text-white mb-4 drop-shadow-sm">Do I need previous yoga experience to teach these materials?</h3>
              <p className="text-white/90 leading-relaxed text-base">
                Not at all! Our content is designed for educators of all experience levels. The videos provide clear instruction that you can follow along with your students.
              </p>
            </div>

            <div className="p-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-2xl" style={{ background: 'linear-gradient(135deg, #1B90A4, #167A8C)' }}>
              <h3 className="text-xl font-bold text-white mb-4 drop-shadow-sm">How do your resources align with PE standards?</h3>
              <p className="text-white/90 leading-relaxed text-base">
                Our yoga program aligns with the 2024 SHAPE America National Physical Education Standards, supporting physical literacy, movement competency, and lifelong wellness habits.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
