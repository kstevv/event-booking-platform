import { google } from 'googleapis';

const calendar = google.calendar('v3');

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

auth.setCredentials({
  access_token: 'your-manually-generated-access-token',
  refresh_token: 'your-refresh-token',
  scope: 'https://www.googleapis.com/auth/calendar',
  token_type: 'Bearer',
  expiry_date: Date.now() + 3600 * 1000,
});

export async function createGoogleCalendarEvent({
  artist,
  venue,
  city,
  date,
  description,
}: {
  artist: string;
  venue: string;
  city: string;
  date: string;
  description?: string;
}) {
  const response = await calendar.events.insert({
    calendarId: 'primary',
    auth,
    requestBody: {
      summary: `${artist} @ ${venue}`,
      location: city,
      description: description || '',
      start: {
        dateTime: date,
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: new Date(new Date(date).getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hr default
        timeZone: 'America/Los_Angeles',
      },
    },
  });

  return response.data;
}
