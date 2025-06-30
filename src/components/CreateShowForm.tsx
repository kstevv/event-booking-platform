// CreateShowForm.tsx
'use client';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { venues } from '../data/venues';

export default function CreateShowForm() {
  const [artist, setArtist] = useState('');
  const [venueId, setVenueId] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [email] = useState('princekevinprince@gmail.com'); // Static for now

  useEffect(() => {
    const selected = venues.find(v => v.id === venueId);
    setCity(selected?.city || '');
  }, [venueId]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('artist', artist);
  formData.append('venueId', venueId);
  formData.append('city', city);
  formData.append('date', date?.toISOString() || '');
  formData.append('description', description);
  formData.append('email', email);
  if (flyerFile) formData.append('flyer', flyerFile);

  const res = await fetch('/api/shows', {
    method: 'POST',
    body: formData,
  });

  const result = await res.json(); // ✅ Define `result` here

  if (!res.ok) {
    console.error('❌ Failed to create show:', result);
    alert(`❌ Failed to create show: ${result.error || 'Unknown error'}`);
    return;
  }

  alert('✅ Show created and synced!');
  setArtist('');
  setVenueId('');
  setCity('');
  setDate(null);
  setDescription('');
  setFlyerFile(null);
};



  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold">Create New Show</h1>

      <input
        type="text"
        placeholder="Artist Name"
        className="w-full p-2 bg-black text-white border"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
      />

      <select
        className="w-full p-2 bg-black text-white border"
        value={venueId}
        onChange={(e) => setVenueId(e.target.value)}
      >
        <option value="">Select Venue</option>
        {venues.map(v => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="City"
        className="w-full p-2 bg-black text-white border"
        value={city}
        disabled
      />

      <DatePicker
        selected={date}
        onChange={(date) => setDate(date)}
        placeholderText="Select Date & Time"
        className="w-full p-2 bg-black text-white border"
        showTimeSelect
        dateFormat="Pp"
      />

      <textarea
        placeholder="Description (optional)"
        className="w-full p-2 bg-black text-white border"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="file"
        accept="image/*"
        className="w-full p-2 bg-black text-white border"
        onChange={(e) => setFlyerFile(e.target.files?.[0] || null)}
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Create & Sync Show
      </button>
    </form>
  );
}