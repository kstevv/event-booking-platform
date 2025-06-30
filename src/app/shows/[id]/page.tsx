import { prisma } from '@/lib/prisma';
import CreateEventButton from '@/components/CreateEventButton';

export default async function ShowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // ✅ await the params

  const show = await prisma.show.findUnique({
  where: { id },
  include: {
    venue: true, // 👈 this enables show.venue.name
  },
});


  if (!show) {
    return <div className="p-6 text-red-600">Show not found</div>;
  }

  const token = await prisma.googleToken.findUnique({
    where: { email: 'princekevinprince@gmail.com' },
  });

  if (!token) {
    return <div className="p-6 text-red-600">No Google token found</div>;
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">{show.artist}</h1>
      <p>{show.description}</p>
      <p>{new Date(show.date).toLocaleString()}</p>

      <CreateEventButton show={{ ...show, venue: show.venue.name }} email="princekevinprince@gmail.com" />
    </main>
  );
}
