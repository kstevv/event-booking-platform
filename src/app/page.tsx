import CreateShowForm from '@/components/CreateShowForm';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function HomePage() {
 const shows = await prisma.show.findMany({
  orderBy: { date: 'asc' },
  include: {
    venue: true, // 👈 this enables `show.venue.name`
  },
});


  const showsByMonth = shows.reduce((acc, show) => {
    const month = new Date(show.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(show);
    return acc;
  }, {} as Record<string, typeof shows>);

  return (
    <main className="p-6 space-y-12">
      <CreateShowForm />

      <div>
        <h1 className="text-3xl font-bold mb-8">📅 Calendar of Shows</h1>

        {Object.entries(showsByMonth).map(([month, monthShows]) => (
          <section key={month} className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">{month}</h2>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {monthShows.map((show) => (
                <Link
                  href={`/shows/${show.id}`}
                  key={show.id}
                  className="block border rounded-lg p-4 hover:shadow-md transition"
                >
                  <h3 className="text-lg font-bold">{show.artist}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(show.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                    {show.venue.name}, {show.city}
                    <p className="text-xs mt-1 text-blue-600 dark:text-blue-400">{show.status}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
