import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log('✅ Token received:', tokens.access_token);

    // Get user email
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 400 });
    }

    // Save or update token
    await prisma.googleToken.upsert({
      where: { email },
      update: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        scope: tokens.scope,
        tokenType: tokens.token_type,
        expiryDate: BigInt(tokens.expiry_date || 0),
      },
      create: {
        email,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        scope: tokens.scope,
        tokenType: tokens.token_type,
        expiryDate: BigInt(tokens.expiry_date || 0),
      },
    });

    return NextResponse.redirect('http://localhost:3000/success'); // update to your UI route

  } catch (error: any) {
    console.error('❌ OAuth error:', error?.response?.data || error.message || error);
    return NextResponse.json({ error: 'Token exchange failed' }, { status: 500 });
  }
}
