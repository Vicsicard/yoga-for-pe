import React from 'react'

export default function PrivacyPage() {
  return (
    <main className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
        <p className="mb-4">
          Welcome to Yoga for PE. We respect your privacy and are committed to protecting your personal data.
          This privacy policy will inform you about how we look after your personal data when you visit our website
          and tell you about your privacy rights and how the law protects you.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">The Data We Collect</h2>
        <p className="mb-4">
          We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">Identity Data includes first name, last name, username or similar identifier.</li>
          <li className="mb-2">Contact Data includes email address and telephone numbers.</li>
          <li className="mb-2">Technical Data includes internet protocol (IP) address, your login data, browser type and version.</li>
          <li className="mb-2">Usage Data includes information about how you use our website and services.</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">How We Use Your Data</h2>
        <p className="mb-4">
          We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">To register you as a new customer.</li>
          <li className="mb-2">To process and deliver your subscription.</li>
          <li className="mb-2">To manage our relationship with you.</li>
          <li className="mb-2">To improve our website, products/services, marketing or customer relationships.</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this privacy policy or our privacy practices, please contact us at:
          <br />
          <a href="mailto:info@yogaforpe.com" className="text-primary-600 hover:underline">info@yogaforpe.com</a>
        </p>
      </section>
    </main>
  )
}
