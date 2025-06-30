'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Show = {
  id: string;
  artist: string;
  venue: string;
  city: string;
  date: string;
  status: string;
  description?: string | null;
  calendarEventLink?: string | null;
};

export default function AdminClient({ shows }: { shows: Show[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this show?')) return;
    setDeleting(id);
    const res = await fetch(`/api/shows/${id}`, { method: 'DELETE' });
    if (res.ok) router.refresh();
    else alert('Failed to delete show');
    setDeleting(null);
  };

  const handleConfirmAndSync = async (show: Show) => {
  setSyncing(show.id);
  console.log('Syncing show:', show);
  const res = await fetch(`/api/shows/${show.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      artist: show.artist,
      venue: show.venue,
      city: show.city,
      date: show.date,
      status: 'CONFIRMED',
      description: show.description || '',
    }),
  });

  if (res.ok) {
    router.refresh();
  } else {
    const error = await res.json();
    alert(`Failed to sync: ${error.error || 'Unknown error'}`);
  }
  setSyncing(null);
};


  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">All Shows</h1>
      {shows.length === 0 ? (
        <p>No shows found.</p>
      ) : (
        <ul className="space-y-4">
          {shows.map(show => (
            <li key={show.id} className="border p-4 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{show.artist}</h2>
                  <p className="text-sm text-gray-600">
                    {show.venue} • {show.city} •{' '}
                    {new Date(show.date).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/admin/edit/${show.id}`}
                    className="text-blue-600 underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(show.id)}
                    disabled={deleting === show.id}
                    className="text-red-600 underline"
                  >
                    {deleting === show.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>

              <div className="mt-2 text-sm">
                {show.calendarEventLink ? (
                  <a
                    href={show.calendarEventLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    📅 View Calendar Event
                  </a>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-red-500">No calendar event</span>
                    <button
                      onClick={() => handleConfirmAndSync(show)}
                      disabled={syncing === show.id}
                      className="text-sm text-blue-500 underline"
                    >
                      {syncing === show.id ? 'Syncing...' : 'Confirm & Sync'}
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
