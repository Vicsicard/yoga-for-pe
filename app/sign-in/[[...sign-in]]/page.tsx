'use client';
 
import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
 
export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access premium yoga videos and resources
          </p>
        </div>
        <Suspense fallback={<div className="text-center">Loading sign-in...</div>}>
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: "bg-green-600 hover:bg-green-700 text-sm normal-case",
                footerActionLink: "text-green-600 hover:text-green-700",
                card: "rounded-xl shadow-md"
              }
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
