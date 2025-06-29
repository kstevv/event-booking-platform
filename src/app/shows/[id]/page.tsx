import { prisma } from '@/lib/prisma';
import ConfirmShowButton from '@/components/ConfirmShowButton';

export default async function ShowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const show = await prisma.show.findUnique({
    where: { id },
  });

  if (!show) return <p>Show not found</p>;

  return (
   <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{show.artist}</h1>
      <p className="mb-2">{show.venue} — {show.city}</p>
      <p className="mb-2">{new Date(show.date).toLocaleString()}</p>
      <p className="mb-4">Status: {show.status}</p>
      <ConfirmShowButton show={show} email="princekevinprince@gmail.com" />
    </div>
  );
}
