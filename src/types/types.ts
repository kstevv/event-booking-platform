// src/types/types.ts

export type Venue = {
  id: string;
  name: string;
  city: string;
};

export type Show = {
  id: string;
  artist: string;
  date: string;
  status: 'PENDING' | 'HOLD' | 'CONFIRMED';
  description?: string;
  venueId: string;
  venue?: Venue;
};
