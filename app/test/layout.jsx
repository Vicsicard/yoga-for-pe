'use client';

export default function TestLayout({ children }) {
  console.log('Test layout rendering');
  
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-100">
          {children}
        </div>
      </body>
    </html>
  );
}
