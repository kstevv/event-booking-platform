'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { venues } from '@/data/venues';
import { ShowStatus } from '@prisma/client';
import { Show } from '@/types/types'; // Make sure this type uses `ShowStatus` from Prisma

export default function EditShowPage() {
  const { id } = useParams();
  const router = useRouter();

  const [show, setShow] = useState<Show | null>(null);
  const [artist, setArtist] = useState('');
  const [venueId, setVenueId] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<ShowStatus>('PENDING');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchShow = async () => {
      const res = await fetch(`/api/shows/${id}`);
      const data = await res.json();
      setShow(data);
      setArtist(data.artist);
      setVenueId(data.venueId);
      setDate(new Date(data.date));
      setStatus(data.status);
      setDescription(data.description || '');
    };

    if (id) fetchShow();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/shows/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artist,
        venueId,
        date,
        status,
        description,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(`❌ Failed to update show: ${err.error}`);
    } else {
      alert('✅ Show updated!');
      router.push('/admin');
    }
  };

  if (!show) return <p className="text-white p-4">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Edit Show</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          className="w-full p-2 bg-black text-white border"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="Artist"
        />

        <select
          className="w-full p-2 bg-black text-white border"
          value={venueId}
          onChange={(e) => setVenueId(e.target.value)}
        >
          <option value="">Select Venue</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.city})
            </option>
          ))}
        </select>

        <DatePicker
          selected={date}
          onChange={(d) => setDate(d)}
          className="w-full p-2 bg-black text-white border"
          showTimeSelect
          dateFormat="Pp"
        />

        <select
          className="w-full p-2 bg-black text-white border"
          value={status}
          onChange={(e) => setStatus(e.target.value as ShowStatus)}
        >
          {['PENDING', 'HOLD', 'CONFIRMED', 'ADVANCED', 'SETTLED'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <textarea
          className="w-full p-2 bg-black text-white border"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
