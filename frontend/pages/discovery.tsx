import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import DeviceCard, { DiscoveredDeviceType } from '../components/DeviceCard'; // Import DeviceCard

// Interface name changed to avoid conflict and ensure compatibility.
interface PageDiscoveredDevice extends DiscoveredDeviceType {}

const DiscoveryPage: NextPage = () => {
  const [discoveredDevices, setDiscoveredDevices] = useState<PageDiscoveredDevice[]>([]);
  const [loadingScan, setLoadingScan] = useState(false);
  const [loadingAccept, setLoadingAccept] = useState(false); // Overall loading state for any accept operation
  const [error, setError] = useState<string | null>(null);

  // States for the accept form
  const [acceptingDevice, setAcceptingDevice] = useState<PageDiscoveredDevice | null>(null); // Stores the device currently being accepted in the modal
  const [sshUsername, setSshUsername] = useState('');
  const [sshPassword, setSshPassword] = useState('');

  const fetchDiscoveredDevices = async () => {
    try {
      setError(null);
      const res = await fetch('/api/devices/discovered');
      if (!res.ok) {
        const errData = await res.json().catch(() => ({})); // Try to parse error, default to empty object
        throw new Error(errData.error || `Error fetching discovered devices: ${res.statusText}`);
      }
      const data = await res.json();
      setDiscoveredDevices(data);
    } catch (err: any) {
      setError(err.message);
      setDiscoveredDevices([]);
    }
  };

  useEffect(() => {
    fetchDiscoveredDevices(); // Fetch on initial load
  }, []);

  const handleScan = async () => {
    setLoadingScan(true);
    setError(null);
    try {
      const res = await fetch('/api/devices/discovery'); // This API initiates a scan and returns results
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error scanning for devices: ${res.statusText}`);
      }
      const data = await res.json();
      setDiscoveredDevices(data); // Assuming /discovery returns the latest list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingScan(false);
    }
  };

  const handleOpenAcceptForm = (device: PageDiscoveredDevice) => {
    setAcceptingDevice(device);
    setSshUsername(''); // Reset for security and usability
    setSshPassword(''); // Reset for security and usability
    setError(null);
  };

  const handleAcceptDevice = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!acceptingDevice) return;

    setLoadingAccept(true);
    setError(null);
    try {
      const res = await fetch('/api/devices/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mac: acceptingDevice.mac,
          sshUsername,
          sshPassword,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error accepting device: ${res.statusText}`);
      }
      // Success
      alert('Device accepted successfully!');
      setAcceptingDevice(null); // Close form
      fetchDiscoveredDevices(); // Refresh the list of discovered devices
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAccept(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Device Discovery</h1>
        <button
          onClick={handleScan}
          disabled={loadingScan || loadingAccept}
          className={`px-6 py-3 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out
            ${(loadingScan || loadingAccept)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300'}`}
        >
          {loadingScan ? 'Scanning...' : 'Scan for New Devices'}
        </button>
      </div>

      {error && !acceptingDevice && <p className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-md">{error}</p>}

      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Discovered Devices</h2>
      {discoveredDevices.length === 0 && !loadingScan && (
        <p className="text-gray-600">No devices discovered yet. Click "Scan for New Devices" to find them.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {discoveredDevices.map((device) => (
          <DeviceCard
            key={device.mac}
            variant="discovery"
            device={device}
            onAccept={handleOpenAcceptForm}
            isAcceptingThisDevice={loadingAccept && acceptingDevice?.mac === device.mac}
          />
        ))}
      </div>

      {acceptingDevice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <form
            onSubmit={handleAcceptDevice}
            className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4"
          >
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">Accept Device</h3>
            <p className="text-sm text-gray-600 mb-6">MAC: {acceptingDevice.mac} {acceptingDevice.hostname && `(${acceptingDevice.hostname})`}</p>

            <div className="mb-4">
              <label htmlFor="sshUsername" className="block text-sm font-medium text-gray-700 mb-1">SSH Username:</label>
              <input
                id="sshUsername"
                type="text"
                value={sshUsername}
                onChange={(e) => setSshUsername(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="sshPassword" className="block text-sm font-medium text-gray-700 mb-1">SSH Password:</label>
              <input
                id="sshPassword"
                type="password"
                value={sshPassword}
                onChange={(e) => setSshPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {error && acceptingDevice && <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => setAcceptingDevice(null)}
                disabled={loadingAccept}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loadingAccept}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50
                  ${loadingAccept ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {loadingAccept ? 'Accepting...' : 'Confirm Acceptance'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DiscoveryPage;
