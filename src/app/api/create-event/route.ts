import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, event } = await req.json();

  const token = await prisma.googleToken.findUnique({
    where: { email },
  });

  if (!token) {
    return NextResponse.json({ error: 'No Google token found for user' }, { status: 404 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
    expiry_date: Number(token.expiryDate),
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.start },
        end: { dateTime: event.end },
      },
    });

    return NextResponse.json({ success: true, eventId: res.data.id });
  } catch (error: any) {
    console.error('Google Calendar error:', error?.response?.data || error.message || error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
