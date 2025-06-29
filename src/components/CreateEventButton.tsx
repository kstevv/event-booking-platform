'use client';

import { useState } from 'react';

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
}

type Props = {
  tokens: Tokens;
};



export default function CreateEventButton({ tokens }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setStatus(null);

    const res = await fetch('/api/google-calendar/create-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'princekevinprince@gmail.comm',
        tokens,
        event: {
          summary: 'Special Delivery Live',
          description: '8PM showtime at The Echo.',
          start: '2025-07-01T20:00:00-07:00',
          end: '2025-07-01T22:00:00-07:00',
        },
      }),
    });

    const result = await res.json();
    if (res.ok) {
      setStatus('✅ Event created!');
    } else {
      setStatus(`❌ Error: ${result.error}`);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Creating event...' : 'Add to Google Calendar'}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
}
