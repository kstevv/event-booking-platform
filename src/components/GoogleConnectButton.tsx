'use client';

export default function GoogleConnectButton() {
  const handleConnect = async () => {
    const res = await fetch('/api/auth/url');
    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Failed to generate Google auth URL');
    }
  };

  return (
    <button
      onClick={handleConnect}
      className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
    >
      Connect Google Calendar
    </button>
  );
}
