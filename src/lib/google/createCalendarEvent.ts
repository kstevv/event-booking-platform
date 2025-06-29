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
  if (show.calendarEventId) return; // already synced

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: `${show.artist} @ ${show.venue}`,
      description: show.description ?? '',
      start: { dateTime: show.date.toISOString() },
      end: {
        dateTime: new Date(show.date.getTime() + 2 * 60 * 60 * 1000).toISOString(), // +2 hrs
      },
    },
  });

  // ✅ Optional: store the Google event ID
  await prisma.show.update({
    where: { id: showId },
    data: { calendarEventId: event.data.id || '' },
  });
}
