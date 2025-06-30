import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';

export async function createCalendarEventForShow(showId: string, userEmail: string) {
  const token = await prisma.googleToken.findUnique({
    where: { email: userEmail },
  });

  if (!token) throw new Error('Google token not found for user');

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

  const show = await prisma.show.findUnique({ where: { id: showId } });
  if (!show) throw new Error('Show not found');
  if (show.calendarEventId) return; // Already synced

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const startTime = show.date.toISOString();
  const endTime = new Date(show.date.getTime() + 2 * 60 * 60 * 1000).toISOString(); // +2 hrs

  console.log('📦 Sending to Google API:', JSON.stringify({
  calendarId: 'primary',
  requestBody: {
    summary: show.artist,
    description: show.description || '',
    start: {
      dateTime: startTime,
      timeZone: 'America/Los_Angeles',
    },
    end: {
      dateTime: endTime,
      timeZone: 'America/Los_Angeles',
    },
  },
}, null, 2));
  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: show.artist,
      description: show.description || '',
      start: {
        dateTime: startTime,
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: endTime,
        timeZone: 'America/Los_Angeles',
      },
    },
  });
console.log('📦 Sending to Google API:', JSON.stringify({
  calendarId: 'primary',
  requestBody: {
    summary: show.artist,
    description: show.description || '',
    start: {
      dateTime: startTime,
      timeZone: 'America/Los_Angeles',
    },
    end: {
      dateTime: endTime,
      timeZone: 'America/Los_Angeles',
    },
  },
}, null, 2));

  // ✅ Optional: Store the Google event ID
  await prisma.show.update({
    where: { id: showId },
    data: { calendarEventId: response.data.id || '' },
  });

  console.log(`✅ Calendar event created: ${response.data.htmlLink}`);
  return response.data.htmlLink;
}
