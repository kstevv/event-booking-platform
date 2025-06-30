// src/app/api/create-event/route.ts
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, event } = await req.json();

    // Get Google token from DB
    const token = await prisma.googleToken.findUnique({
      where: { email },
    });

    if (!token) {
      return NextResponse.json({ error: 'No Google token found for user' }, { status: 404 });
    }

    // Set up Google OAuth client
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

    // Insert event into Google Calendar
    const calendarRes = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.start },
        end: { dateTime: event.end },
      },
    });

    const calendarEventId = calendarRes.data.id;

    // Create show in DB and connect to venue by ID
    const newShow = await prisma.show.create({
      data: {
        artist: event.artist,
        date: new Date(event.start),
        status: event.status,
        description: event.description,
        venue: {
          connect: {
            id: event.venueId,
          },
        },
        calendarEventId,
      },
    });

    return NextResponse.json({ success: true, show: newShow, calendarEventId });
  } catch (error: any) {
    console.error('Error creating event:', error?.response?.data || error.message || error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
