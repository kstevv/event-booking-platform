'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

type Show = {
  id: string;
  artist: string;
  venue: string;
  city: string;
  date: Date;
  status: string;
  description?: string | null;
};

type Props = {
  show: Show;
  email: string;
};

export default function CreateEventButton({ show, email }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!show?.id) {
      toast.error('Missing show ID');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/shows/${show.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist: show.artist,
          venue: show.venue,
          city: show.city,
          date: show.date,
          status: 'CONFIRMED',
          description: show.description,
          email,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to sync with Google Calendar');
      } else {
        toast.success('✅ Event synced to Google Calendar!');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'Syncing…' : 'Sync to Google Calendar'}
    </button>
  );
}
