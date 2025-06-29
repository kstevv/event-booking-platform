import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createGoogleCalendarEvent } from '@/lib/googleCalendar';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { artist, venue, city, date, description } = body;

  if (!artist || !venue || !city || !date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const show = await prisma.show.create({
    data: {
      artist,
      venue,
      city,
      date: new Date(date),
      description,
      status: 'CONFIRMED',
    },
  });

  await createGoogleCalendarEvent({
    artist,
    venue,
    city,
    date,
    description,
  });

  console.log('req body', req.body);
console.log('auth headers', req.headers);

  return NextResponse.json({ success: true, show });
}
