import { google } from 'googleapis';

export function getCalendarClient(tokens: any) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI // optional if set elsewhere
  );

  oauth2Client.setCredentials(tokens);

  return google.calendar({ version: 'v3', auth: oauth2Client });
}
