import React from 'react';

// Base interface for common device properties
export interface DeviceBase {
  mac: string;
  ip?: string | null; // Allow null as per Prisma types
  model?: string | null;
  hostname?: string | null;
  firmware?: string | null;
}

// Interface for devices listed on the Discovery page
export interface DiscoveredDeviceType extends DeviceBase {
  platform?: string | null;
  discoveryType?: string | null;
  // other fields specific to discovery if any
}

// Interface for devices listed on the Managed Devices page
export interface ManagedDeviceType extends DeviceBase {
  name?: string | null; // User-defined name for the device
  lastSeenAgo: number; // Calculated: seconds ago
  ssid?: string | null;
  signalStrength?: number | null; // dBm
  online: boolean;
  uptime?: string | number | null; // Can be string (e.g., "10h 5m") or number (seconds)
  cpuUsage?: string | number | null; // Can be string (e.g., "15.5%") or number
  // Fields from Prisma Device model (via GET /api/devices)
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
  lastSeen?: number | null; // Unix timestamp (seconds) from Prisma
  signal?: number | null; // From Prisma, maps to signalStrength
}

// Props for the DeviceCard component, using a discriminated union for variants
type DeviceCardProps =
  | {
      variant: 'discovery';
      device: DiscoveredDeviceType;
      onAccept: (device: DiscoveredDeviceType) => void;
      isAcceptingThisDevice: boolean; // True if this specific device is being accepted
    }
  | {
      variant: 'managed';
      device: ManagedDeviceType;
    };

const DeviceCard: React.FC<DeviceCardProps> = (props) => {
  const { variant, device } = props;

  const baseClasses = "shadow-lg rounded-lg p-6 border";
  const variantClasses = variant === 'managed'
    ? (props.device.online ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300")
    : "bg-white border-blue-300";

  const deviceName = variant === 'managed'
    ? props.device.name || props.device.hostname
    : device.hostname;

  return (
    <div className={`${baseClasses} ${variantClasses} flex flex-col justify-between`}>
      <div>
        <h3 className="text-xl font-semibold mb-2 text-gray-800">{deviceName || device.mac}</h3>
        <p className="text-sm text-gray-600"><span className="font-medium">MAC:</span> {device.mac}</p>
        {device.ip && <p className="text-sm text-gray-600"><span className="font-medium">IP:</span> {device.ip}</p>}
        {device.model && <p className="text-sm text-gray-600"><span className="font-medium">Model:</span> {device.model}</p>}
        {device.firmware && <p className="text-sm text-gray-600"><span className="font-medium">Firmware:</span> {device.firmware}</p>}

        {variant === 'managed' && (
          <div className="mt-4 space-y-1">
            <p className={`text-sm font-medium ${props.device.online ? 'text-green-700' : 'text-red-700'}`}>
              Status: {props.device.online ? 'Online' : 'Offline'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Last Seen:</span>
              {props.device.lastSeenAgo < Infinity && props.device.lastSeenAgo >= 0 ? ` ${props.device.lastSeenAgo}s ago` : ' Never'}
            </p>
            {props.device.ssid && <p className="text-sm text-gray-600"><span className="font-medium">SSID:</span> {props.device.ssid}</p>}
            {props.device.signalStrength !== undefined && props.device.signalStrength !== null && (
              <p className="text-sm text-gray-600"><span className="font-medium">Signal:</span> {props.device.signalStrength} dBm</p>
            )}
            {props.device.uptime !== undefined && props.device.uptime !== null && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Uptime:</span>
                {typeof props.device.uptime === 'number' ? ` ${Math.floor(props.device.uptime / 3600)}h ${Math.floor((props.device.uptime % 3600) / 60)}m` : ` ${props.device.uptime}`}
              </p>
            )}
            {props.device.cpuUsage !== undefined && props.device.cpuUsage !== null && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">CPU Usage:</span>
                {typeof props.device.cpuUsage === 'number' ? ` ${props.device.cpuUsage.toFixed(1)}%` : ` ${props.device.cpuUsage}`}
              </p>
            )}
          </div>
        )}

        {variant === 'discovery' && (
          <div className="mt-4 space-y-1">
            {props.device.platform && <p className="text-sm text-gray-600"><span className="font-medium">Platform:</span> {props.device.platform}</p>}
            {props.device.discoveryType && <p className="text-sm text-gray-600"><span className="font-medium">Discovery Type:</span> {props.device.discoveryType}</p>}
          </div>
        )}
      </div>

      {variant === 'discovery' && (
        <button
          onClick={() => props.onAccept(props.device)}
          disabled={props.isAcceptingThisDevice}
          className={`mt-6 w-full text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out
            ${props.isAcceptingThisDevice
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'}`}
        >
          {props.isAcceptingThisDevice ? 'Accepting...' : 'Accept Device'}
        </button>
      )}
    </div>
  );
};

export default DeviceCard;
