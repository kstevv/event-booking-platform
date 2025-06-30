'use client';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function AuthButtons() {
  const { data: session } = useSession();

  return session ? (
    <button onClick={() => signOut()} className="text-sm text-red-500">Sign Out</button>
  ) : (
    <button onClick={() => signIn('google')} className="text-sm text-blue-500">Sign In</button>
  );
}
