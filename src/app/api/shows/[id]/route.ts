import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const body = await req.json();
    const { email } = body;

    const show = await prisma.show.findUnique({ where: { id } });
    if (!show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    const token = await prisma.googleToken.findUnique({ where: { email } });
    if (!token) {
      return NextResponse.json({ error: 'No token found for user' }, { status: 401 });
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

    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
    } catch (err) {
      console.error('❌ Token refresh failed:', err);
      return NextResponse.json({ error: 'Token refresh failed' }, { status: 401 });
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const calendarEvent = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: `${show.artist} @ ${show.venue}`,
        description: show.description || '',
        start: { dateTime: new Date(show.date).toISOString() },
        end: {
          dateTime: new Date(
            new Date(show.date).getTime() + 2 * 60 * 60 * 1000
          ).toISOString(),
        },
      },
    });

    const updatedShow = await prisma.show.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        calendarEventId: calendarEvent.data.id ?? '',
      },
    });

    return NextResponse.json({ message: 'Show confirmed and calendar synced', show: updatedShow });
  } catch (error: any) {
    console.error('❌ API Error:', error.message || error);
    return NextResponse.json({ error: 'Failed to update show' }, { status: 500 });
  }
}
