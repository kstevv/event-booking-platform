'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShowStatus } from '@prisma/client';

type Show = {
  id: string;
  artist: string;
  venue: string;
  city: string;
  date: string; // ISO string
  description: string | null;
  status: ShowStatus;
};

export default function EditShowForm({ show }: { show: Show }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    artist: show.artist || '',
    venue: show.venue || '',
    city: show.city || '',
    date: show.date ? new Date(show.date).toISOString().slice(0, 16) : '',
    description: show.description || '',
    status: show.status || 'PENDING',
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await fetch(`/api/shows/${show.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        date: new Date(formData.date),
      }),
    });

    if (res.ok) {
      router.push('/admin');
    } else {
      console.error('❌ Failed to update show');
    }

    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
      <input
        type="text"
        name="artist"
        value={formData.artist}
        onChange={handleChange}
        placeholder="Artist"
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="text"
        name="venue"
        value={formData.venue}
        onChange={handleChange}
        placeholder="Venue"
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="text"
        name="city"
        value={formData.city}
        onChange={handleChange}
        placeholder="City"
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="datetime-local"
        name="date"
        value={formData.date}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <textarea
        name="description"
        value={formData.description || ''}
        onChange={handleChange}
        placeholder="Description"
        className="w-full p-2 border rounded"
      />
      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        {Object.values(ShowStatus).map(status => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
