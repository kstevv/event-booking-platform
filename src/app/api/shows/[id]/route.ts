import { NextRequest, NextResponse } from 'next/server';
import { google, calendar_v3 } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { getOAuthClient } from '@/lib/google';

export async function PATCH(
  req: NextRequest,
  context: any // <-- use `any` or a properly awaited object
) {
  const id = context?.params?.id;

  if (!id) {
    return NextResponse.json({ error: 'Missing ID in route params' }, { status: 400 });
  }

  try {
    const { email } = await req.json();

    // 1. Fetch the show
    const show = await prisma.show.findUnique({ where: { id } });
    if (!show) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    // 2. Fetch Google token
    const token = await prisma.googleToken.findUnique({ where: { email } });
    if (!token) {
      return NextResponse.json({ error: 'Google token not found' }, { status: 401 });
    }

    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
      expiry_date: Number(token.expiryDate),
    });

    // 3. Try refreshing the token
    try {
      console.log('🔑 Refreshing token for:', email);
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
    } catch (refreshError) {
      console.error('❌ Token refresh failed:', refreshError);

      // Optionally delete token so user must reconnect
      await prisma.googleToken.delete({ where: { email } });

      return NextResponse.json(
        { error: 'Google token is invalid or expired. Please reconnect.' },
        { status: 401 }
      );
    }

    // 4. Create calendar event
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event: calendar_v3.Schema$Event = {
      summary: show.artist,
      location: show.venue,
      description: show.description || '',
      start: {
        dateTime: new Date(show.date).toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: new Date(new Date(show.date).getTime() + 2 * 60 * 60 * 1000).toISOString(),
        timeZone: 'America/New_York',
      },
    };

    const calendarResponse = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    const eventId = calendarResponse.data.id || '';
    const htmlLink = calendarResponse.data.htmlLink || null;

    // 5. Save calendar event ID
    await prisma.show.update({
      where: { id },
      data: { calendarEventId: eventId },
    });

    return NextResponse.json({ success: true, htmlLink });
  } catch (err) {
    console.error('❌ Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
