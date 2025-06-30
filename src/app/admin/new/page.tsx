'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function NewShowPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const email = session?.user?.email;

  const [formData, setFormData] = useState({
    artist: '',
    venue: '',
    city: '',
    date: '',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      alert('You must be signed in to create a show.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date),
          email,
        }),
      });

      const text = await res.text();

      try {
        const data = JSON.parse(text);
        console.log('Server response:', data);

        if (!res.ok) {
          alert(data.error || 'Failed to create show');
        } else {
          router.push('/admin');
        }
      } catch (jsonError) {
        console.error('❌ Failed to parse JSON:', text);
        alert('❌ Server returned invalid response. Check server logs.');
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      alert('❌ Network error. Please try again.');
    }

    setSubmitting(false);
  };

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Show</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="artist"
          placeholder="Artist"
          value={formData.artist}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="venue"
          placeholder="Venue"
          value={formData.venue}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="date"
          type="datetime-local"
          value={formData.date}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create Show'}
        </button>
      </form>
    </main>
  );
}
