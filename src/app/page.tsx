import { prisma } from '@/lib/prisma';
import CreateEventButton from '@/components/CreateEventButton';

export default async function HomePage() {
  const token = await prisma.googleToken.findUnique({
    where: { email: 'princekevinprince@gmail.com' },
  });

  if (!token) {
    return <div className="p-6 text-red-600">No token found</div>;
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Special Delivery</h1>
      <CreateEventButton
        tokens={{
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          expiryDate: Number(token.expiryDate),
        }}
      />
    </main>
  );
}
