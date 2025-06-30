import { NextRequest } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { getGoogleAuthToken, getGoogleOAuthTokens } from '@/lib/google';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    const { artist, venue, city, date, status } = body;

    const updateData: any = {
      artist,
      venue,
      city,
      date,
      status,
    };

    // Only sync to Google Calendar if confirmed
    if (status === 'CONFIRMED') {
      const tokenData = await getGoogleAuthToken(process.env.ADMIN_GOOGLE_EMAIL!);
      if (!tokenData) throw new Error('Missing Google token data');

      const oAuth2Client = getGoogleOAuthTokens({
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiryDate: Number(tokenData.expiryDate),
      });

      const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

      const eventStart = new Date(date).toISOString();
      const eventEnd = new Date(new Date(date).getTime() + 2 * 60 * 60 * 1000).toISOString();

      const calendarEvent = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: artist,
          location: typeof venue === 'string' ? venue : venue?.name ?? '',
          description: `Performance at ${typeof venue === 'string' ? venue : venue?.name}, ${city}`,
          start: {
            dateTime: eventStart,
            timeZone: 'America/Los_Angeles',
          },
          end: {
            dateTime: eventEnd,
            timeZone: 'America/Los_Angeles',
          },
        },
      });

      updateData.calendarEventId = calendarEvent.data.id ?? null;
      updateData.calendarEventLink = calendarEvent.data.htmlLink ?? null;
    }

    const updatedShow = await prisma.show.update({
      where: { id },
      data: updateData,
    });

    return new Response(JSON.stringify(updatedShow), { status: 200 });
  } catch (error) {
    console.error('❌ Failed to sync with Google Calendar:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
