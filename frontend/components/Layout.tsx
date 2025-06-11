import React, { ReactNode } from 'react';
import Link from 'next/link';
import Head from 'next/head';

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title = 'AirControl Frontend' }: Props) => (
  <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <header className="bg-gray-800 text-white shadow-md">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold hover:text-gray-300">
          AirControl
        </Link>
        <div className="space-x-4">
          <Link href="/discovery" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
            Device Discovery
          </Link>
          <Link href="/devices" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
            Managed Devices
          </Link>
        </div>
      </nav>
    </header>
    <main className="flex-grow container mx-auto px-6 py-8">
      {children}
    </main>
    <footer className="bg-gray-800 text-white text-center py-4 mt-auto">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} AirControl. All rights reserved.</p>
        {/* Removed the <hr /> as border-top is handled by Tailwind or can be added if desired */}
        {/* Replaced simple span with a more formal copyright */}
      </div>
    </footer>
  </div>
);

export default Layout;
