import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { io, Socket } from 'socket.io-client';
import DeviceCard, { ManagedDeviceType } from '../components/DeviceCard'; // Import DeviceCard

// Interface name changed to avoid conflict if ManagedDeviceType is also imported for other reasons.
// It needs to be compatible with ManagedDeviceType from DeviceCard.
interface PageManagedDevice extends ManagedDeviceType {}


const DevicesPage: NextPage = () => {
  const [managedDevices, setManagedDevices] = useState<PageManagedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialDevices = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/devices');
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Error fetching devices: ${res.statusText}`);
        }
        const data: any[] = await res.json();

        const initialDevices: ManagedDevice[] = data.map((device: any) => {
          const lastSeenTimestamp = device.lastSeen; // Assuming this is a Unix timestamp in seconds
          let lastSeenAgoValue = Infinity;
          let isOnline = false;
          if (lastSeenTimestamp) {
            lastSeenAgoValue = Math.floor(Date.now() / 1000) - lastSeenTimestamp;
            isOnline = lastSeenAgoValue < 60; // Consider online if seen in the last 60 seconds
          }

          return {
            // Spread all fields from the DB record
            ...device,
            // Ensure types and calculated fields are correctly mapped
            mac: device.mac,
            ip: device.ip,
            model: device.model,
            hostname: device.hostname,
            firmware: device.firmware,
            name: device.name,
            sshUsername: device.sshUsername,
            createdAt: device.createdAt,
            updatedAt: device.updatedAt,
            lastSeen: device.lastSeen,
            signal: device.signal, // raw signal from DB
            // Real-time calculated fields (will be updated by socket)
            lastSeenAgo: lastSeenAgoValue,
            online: isOnline,
            signalStrength: device.signal, // Use 'signal' from DB as initial signalStrength
            ssid: device.ssid, // Assuming ssid might be in DB, or comes from socket
          };
        });
        setManagedDevices(initialDevices);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialDevices();

    const socket: Socket = io('http://localhost:3000', {
        path: '/socket.io',
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
    });

    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket.id);
      setError(null); // Clear connection errors on successful connect
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        socket.connect();
      }
      // else the socket will automatically try to reconnect for other reasons
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err);
      // Only set error if not already loading initial data or if it's a persistent issue
      if (!loading || managedDevices.length > 0) {
        setError(`Socket connection error: ${err.message}. Ensure backend (port 3000) is running and reachable.`);
      }
    });

    socket.on('metrics', (devicesMetrics: ManagedDevice[]) => {
      // metrics event provides the most up-to-date state for all devices
      setManagedDevices(devicesMetrics);
      if (loading) setLoading(false); // Stop loading if metrics start flowing
      if (error) setError(null); // Clear errors if metrics are flowing
    });

    return () => {
      console.log('Socket.IO disconnecting...');
      socket.disconnect();
    };
  }, [loading]); // Rerun effect if loading changes (e.g. to clear socket error)

  if (loading && managedDevices.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-500">Loading managed devices...</p>
      </div>
    );
  }

  if (error && managedDevices.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Managed Devices</h1>
        <p className="p-4 text-red-700 bg-red-100 border border-red-300 rounded-md">Initial Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Managed Devices</h1>

      {/* Display persistent socket error even if some devices are shown */}
      {error && managedDevices.length > 0 && (
        <p className="mb-6 p-4 text-orange-700 bg-orange-100 border border-orange-300 rounded-md">
          Socket Connection Issue: {error}. Data might be stale.
        </p>
      )}

      {managedDevices.length === 0 && !loading && !error && (
        <p className="text-gray-600">No managed devices found. Ensure devices are accepted via the Discovery page.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {managedDevices.map((device) => (
          <DeviceCard key={device.mac} variant="managed" device={device} />
        ))}
      </div>
    </div>
  );
};

export default DevicesPage;
