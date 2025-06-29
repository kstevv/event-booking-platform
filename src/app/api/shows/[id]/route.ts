// src/app/api/shows/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { google, calendar_v3 } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { getOAuthClient } from '@/lib/google';

  export async function PATCH(
    req: NextRequest,
    context: { params: { id: string } }
  ) {
    const { id } = context.params;

  try {
    const { email } = await req.json();

    const show = await prisma.show.findUnique({ where: { id } });
    if (!show) return NextResponse.json({ error: 'Show not found' }, { status: 404 });

    const token = await prisma.googleToken.findUnique({ where: { email } });
    if (!token) return NextResponse.json({ error: 'Token not found' }, { status: 401 });

    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
      expiry_date: Number(token.expiryDate),
    });

    // ⛑️ Refresh token
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
    } catch (refreshError) {
      console.error('❌ Token refresh failed:', refreshError);
      await prisma.googleToken.delete({ where: { email } });

      return NextResponse.json(
        { error: 'Google token expired or revoked', needsReauth: true },
        { status: 401 }
      );
    }

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

    await prisma.show.update({
      where: { id },
      data: { calendarEventId: calendarResponse.data.id || '' },
    });

    return NextResponse.json({
      success: true,
      htmlLink: calendarResponse.data.htmlLink || null,
    });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
