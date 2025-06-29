'use client';

import { useState } from 'react';
import axios from 'axios';
import { Show } from '@prisma/client'; // optional, if you're using Prisma types

interface ConfirmShowButtonProps {
  show: Show; // or `any` if you prefer
  email: string;
}

export default function ConfirmShowButton({ show, email }: ConfirmShowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  async function confirmShow() {
    setLoading(true);
    setStatus('');

    try {
      const res = await axios.patch(`/api/shows/${show.id}`, {
        email, // ✅ uses passed-in prop
      });

      setStatus('✅ Show confirmed & calendar synced');
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
    </div>
  );
}
