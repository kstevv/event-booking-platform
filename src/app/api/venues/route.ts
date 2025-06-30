// File: src/app/api/venues/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const venues = await prisma.venue.findMany({
    select: { id: true, name: true, city: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(venues);
}
