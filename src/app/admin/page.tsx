'use client';

import { useEffect, useState } from 'react';
import { Show as PrismaShow, Venue } from '@prisma/client';
import ShowCard from '@/components/ShowCard';
import Sidebar from '@/components/Sidebar';
import { format } from 'date-fns';

interface ShowWithVenue extends PrismaShow {
  venue: Venue;
}

export default function ShowsPage() {
  const [shows, setShows] = useState<ShowWithVenue[]>([]);
  const [selectedShow, setSelectedShow] = useState<ShowWithVenue | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchShows = async () => {
      const res = await fetch('/api/shows');
      const data = await res.json();
      setShows(data);
    };
    fetchShows();
  }, []);

  const handleEventClick = (show: ShowWithVenue) => {
    setSelectedShow(show);
    setIsOpen(true);
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Calendar of Shows</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {shows.map((show) => (
            <div
              key={show.id}
              onClick={() => handleEventClick(show)}
              className="cursor-pointer"
            >
              <ShowCard show={show} />
            </div>
          ))}
        </div>

        {isOpen && selectedShow && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white text-black rounded-lg shadow-lg p-6 w-80">
              <h2 className="text-xl font-bold mb-2">{selectedShow.artist}</h2>
              {selectedShow.description && <p className="mb-2">{selectedShow.description}</p>}
              <p className="mb-1">
                <strong>Date:</strong> {format(new Date(selectedShow.date), 'PPpp')}
              </p>
              <p className="mb-1">
                <strong>Venue:</strong> {selectedShow.venue?.name ?? selectedShow.venueId}
              </p>
              <p className="mb-1">
                <strong>City:</strong> {selectedShow.venue?.city ?? 'N/A'}
              </p>
              <p className="mb-2">
                <strong>Status:</strong> {selectedShow.status}
              </p>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
