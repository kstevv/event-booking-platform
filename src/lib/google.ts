// src/lib/google.ts
import { google } from 'googleapis';
import { prisma } from './prisma';

export function getOAuthClient() {
  return new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: process.env.GOOGLE_REDIRECT_URI!,
  });
}

export async function getGoogleOAuthClient(email: string) {
  const token = await prisma.googleToken.findUnique({ where: { email } });
  if (!token) throw new Error('Google token not found');

  const oauth2Client = getOAuthClient();

  oauth2Client.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
    scope: token.scope ?? undefined,
    token_type: token.tokenType,
    expiry_date: Number(token.expiryDate),
  });

  // 🔁 Refresh the access token if it's expired
 if (Date.now() >= Number(token.expiryDate)) {
  const { credentials } = await oauth2Client.refreshAccessToken();

  await prisma.googleToken.update({
    where: { id: token.id },
    data: {
      accessToken: credentials.access_token!,
      expiryDate: BigInt(credentials.expiry_date!),
    },
  });

  oauth2Client.setCredentials(credentials); // <- use refreshed token
}


  return oauth2Client;
}
