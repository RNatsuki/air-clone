import type { NextPage } from 'next';
import Link from 'next/link';

const HomePage: NextPage = () => {
  return (
    <div className="text-center py-10">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
        Welcome to <span className="text-blue-600">AirControl</span>
      </h1>
      <p className="text-xl text-gray-700 mb-8">
        Your central hub for network device monitoring and management.
      </p>
      <div className="space-x-4">
        <Link href="/discovery" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150">
            Discover Devices
        </Link>
        <Link href="/devices" className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-150">
            View Managed Devices
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
