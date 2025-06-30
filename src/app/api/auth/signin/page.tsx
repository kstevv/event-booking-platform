// src/app/auth/signin/page.tsx
'use client';

import { signIn } from 'next-auth/react';

export default function SignInPage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>
      <button
        onClick={() => signIn('google')}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-semibold"
      >
        Sign in with Google
      </button>
    </main>
  );
}
