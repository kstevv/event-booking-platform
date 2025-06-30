'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Admin' },
    { href: '/shows', label: 'Shows' },
    { href: '/calendar', label: 'Calendar' },
  ];

  return (
    <aside className="w-48 min-h-screen bg-[#0c1a2b] text-white p-4">
      <h2 className="text-lg font-bold mb-4">Navigation</h2>
      <nav className="space-y-2">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`block px-2 py-1 rounded hover:bg-[#1a2b44] transition ${
              pathname === href ? 'bg-[#1a2b44] font-semibold' : ''
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
