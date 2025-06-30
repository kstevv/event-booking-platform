import type { Show, ShowStatus } from '@prisma/client';

interface ShowCardProps {
  show: Show & { venue: { name: string; city: string } };
}

export default function ShowCard({ show }: ShowCardProps) {
  return (
    <div
      className={`p-4 rounded shadow-md transition ${
        show.status === 'CONFIRMED'
          ? 'bg-green-600'
          : show.status === 'PENDING'
          ? 'bg-blue-600'
          : show.status === 'HOLD'
          ? 'bg-yellow-500'
          : 'bg-gray-600'
      }`}
    >
      <h2 className="text-xl font-bold">{show.artist}</h2>
      <p className="text-sm">{new Date(show.date).toLocaleString()}</p>
      <p className="text-sm">{show.venue.name}</p>
      <p className="text-sm">{show.venue.city}</p>
      <p className="text-sm">{show.status}</p>
    </div>
  );
}
