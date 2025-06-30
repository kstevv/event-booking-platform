// src/app/api/shows/route.ts
import { google } from 'googleapis';
import { NextRequest } from 'next/server';
import { getGoogleOAuthClient } from '@/lib/google';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const artist = formData.get('artist')?.toString();
    const email = formData.get('email')?.toString();
    const date = new Date(formData.get('date')?.toString() || '');
    const city = formData.get('city')?.toString();
    const description = formData.get('description')?.toString();
    const venueId = formData.get('venueId')?.toString();

    if (!artist || !email || !date || !venueId || !city) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const oauth2Client = await getGoogleOAuthClient(email);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const calendarEvent = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: artist,
        description: description || '',
        location: city,
        start: {
          dateTime: date.toISOString(),
          timeZone: 'America/Chicago',
        },
        end: {
          dateTime: new Date(date.getTime() + 2 * 60 * 60 * 1000).toISOString(),
          timeZone: 'America/Chicago',
        },
      },
    });

    const eventLink = calendarEvent.data.htmlLink || null;
    const calendarEventId = calendarEvent.data.id || null;

    const flyer = formData.get('flyer') as File | null;
    let flyerUrl = null;

    if (flyer && flyer instanceof File) {
      // TODO: Upload to S3 or cloud storage, get flyerUrl
    }

    await prisma.show.create({
      data: {
        artist,
        city,
        date,
        venueId,
        description: description || '',
        flyerUrl,
        calendarEventId,
        calendarEventLink: eventLink,
        status: 'PENDING',
      },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    console.error('❌ API Error:', error);

    return new Response(
      JSON.stringify({ error: error?.message || 'Google Calendar API failed' }),
      { status: 500 }
    );
  }
}
