// src/app/api/spotify/search/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 });

  try {
    const authRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(
            process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
          ).toString('base64'),
      },
      body: 'grant_type=client_credentials',
    });

    const { access_token } = await authRes.json();

    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=5`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const data = await searchRes.json();
    return NextResponse.json(data.artists.items);
  } catch (err) {
    console.error('Spotify search error:', err);
    return NextResponse.json({ error: 'Failed to fetch Spotify artists' }, { status: 500 });
  }
}
