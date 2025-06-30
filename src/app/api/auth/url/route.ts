import { getOAuthClient } from '@/lib/google';
import { NextResponse } from 'next/server';

export async function GET() {
  const oauth2Client = getOAuthClient();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/calendar'
    ],
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
  });

  return NextResponse.json({ url });
}
