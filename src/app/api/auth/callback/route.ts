import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { getOAuthClient } from '@/lib/google';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  const oauth2Client = getOAuthClient();

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('🔑 Retrieved tokens:', tokens);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;

    if (!email) {
      return NextResponse.json({ error: 'No email from Google' }, { status: 400 });
    }

    await prisma.googleToken.upsert({
      where: { email },
      update: {
        accessToken: tokens.access_token || '',
        refreshToken: tokens.refresh_token || '',
        expiryDate: BigInt(tokens.expiry_date || Date.now()),
        scope: tokens.scope,
        tokenType: tokens.token_type,
      },
      create: {
        email,
        accessToken: tokens.access_token || '',
        refreshToken: tokens.refresh_token || '',
        expiryDate: BigInt(tokens.expiry_date || Date.now()),
        scope: tokens.scope,
        tokenType: tokens.token_type,
      },
    });

    return NextResponse.redirect('http://localhost:3000/admin');
  } catch (err) {
    console.error('OAuth Error:', err);
    return NextResponse.json({ error: 'Token exchange failed' }, { status: 500 });
  }
}
