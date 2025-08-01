"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function EmailTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: 'Test User',
    email: 'test@example.com',
    subject: 'SMTP Test Message',
    message: 'This is a test message to verify SMTP functionality.',
    newsletter: false
  });
  const [formResult, setFormResult] = useState(null);

  // Test SMTP connection
  const testSmtpConnection = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/test/smtp');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: {
          message: error.message
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle contact form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContactForm({
      ...contactForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Test contact form submission
  const testContactForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormResult(null);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactForm)
      });
      
      const data = await response.json();
      setFormResult({
        success: response.ok,
        status: response.status,
        data
      });
    } catch (error) {
      setFormResult({
        success: false,
        error: {
          message: error.message
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/admin" className="text-blue-500 hover:underline mb-4 inline-block">
          &larr; Back to Admin
        </Link>
        <h1 className="text-3xl font-bold mb-4">Email System Diagnostics</h1>
        <p className="text-gray-600 mb-8">
          Use this page to test and troubleshoot the email system configuration.
        </p>
      </div>

      {/* SMTP Connection Test */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">SMTP Connection Test</h2>
        <p className="text-gray-600 mb-4">
          This will test the SMTP connection to verify server configuration.
        </p>
        
        <button
          onClick={testSmtpConnection}
          disabled={loading}
          className={`px-4 py-2 rounded ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium`}
        >
          {loading ? 'Testing...' : 'Test SMTP Connection'}
        </button>
        
        {result && (
          <div className="mt-6 border rounded-lg overflow-hidden">
            <div className={`p-4 ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <h3 className="font-semibold">
                {result.success ? '✅ Connection Successful' : '❌ Connection Failed'}
              </h3>
            </div>
            <div className="p-4 bg-gray-50 overflow-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Contact Form Test */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Contact Form Test</h2>
        <p className="text-gray-600 mb-4">
          This will test the contact form submission process.
        </p>
        
        <form onSubmit={testContactForm} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={contactForm.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={contactForm.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              value={contactForm.subject}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              name="message"
              value={contactForm.message}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            ></textarea>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="newsletter"
              checked={contactForm.newsletter}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Subscribe to newsletter
            </label>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium`}
          >
            {loading ? 'Sending...' : 'Test Contact Form'}
          </button>
        </form>
        
        {formResult && (
          <div className="mt-6 border rounded-lg overflow-hidden">
            <div className={`p-4 ${formResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <h3 className="font-semibold">
                {formResult.success ? '✅ Form Submission Successful' : '❌ Form Submission Failed'}
              </h3>
              <p>{formResult.success ? 'Email sent successfully' : `Error: ${formResult.data?.error}`}</p>
            </div>
            <div className="p-4 bg-gray-50 overflow-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(formResult, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Environment Variables Reference */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-2">Environment Variables Reference</h2>
        <p className="text-gray-600 mb-4">
          Make sure these environment variables are properly configured in your Vercel project settings:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><code className="bg-gray-100 px-1 py-0.5 rounded">SMTP_HOST</code> - SMTP server hostname (e.g., mail.yogaforpe.com)</li>
          <li><code className="bg-gray-100 px-1 py-0.5 rounded">SMTP_PORT</code> - SMTP server port (587 for STARTTLS)</li>
          <li><code className="bg-gray-100 px-1 py-0.5 rounded">SMTP_SECURE</code> - Whether to use SSL/TLS (false for port 587)</li>
          <li><code className="bg-gray-100 px-1 py-0.5 rounded">SMTP_USER</code> - SMTP username (e.g., info@yogaforpe.com)</li>
          <li><code className="bg-gray-100 px-1 py-0.5 rounded">SMTP_PASSWORD</code> - SMTP password</li>
          <li><code className="bg-gray-100 px-1 py-0.5 rounded">SMTP_FROM</code> - From email address (e.g., info@yogaforpe.com)</li>
          <li><code className="bg-gray-100 px-1 py-0.5 rounded">CONTACT_EMAIL</code> - Where to send contact form submissions (e.g., hello@yogaforpe.com)</li>
        </ul>
      </div>
    </div>
  );
}
