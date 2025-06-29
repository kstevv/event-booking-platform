'use client';

import { useState } from 'react';
import axios from 'axios';
import { Show } from '@prisma/client';

interface ConfirmShowButtonProps {
  show: Show;
  email: string;
}

export default function ConfirmShowButton({ show, email }: ConfirmShowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [eventLink, setEventLink] = useState<string | null>(null);

  async function confirmShow() {
    setLoading(true);
    setStatus('');
    setEventLink(null);

    try {
      const res = await axios.patch(`/api/shows/${show.id}`, { email });
      setStatus('✅ Show confirmed & calendar synced');
      setEventLink(res.data.htmlLink); // ← This should now work!

      const { calendarEventId } = res.data; // ✅ extract from API response
      setStatus('✅ Show confirmed & calendar synced');

      // ✅ generate Google Calendar link
      setEventLink(`https://calendar.google.com/calendar/event?eid=${calendarEventId}`);
    } catch (err) {
      console.error(err);
      setStatus('❌ Error: Failed to update show');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={confirmShow}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Confirming...' : 'Confirm Show'}
      </button>
      {status && <p className="mt-2">{status}</p>}
      {eventLink && (
        <a
          href={eventLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-blue-600 underline"
        >
          View in Google Calendar
        </a>
      )}
    </div>
  );
}
