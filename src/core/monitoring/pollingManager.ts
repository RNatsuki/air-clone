// core/monitoring/pollingManager.ts
import { pollDeviceMetrics } from "./";
import { getDevices } from "../devices/deviceService";

const POLL_INTERVAL = 30_000; // 30s
const pollers = new Map<string, NodeJS.Timeout>();

export async function startPolling() {
  const devices = await getDevices();
  for (const device of devices) {
    if (pollers.has(device.mac)) continue;

    pollers.set(device.mac, setInterval(() => {
      pollDeviceMetrics(device as any);
    }, POLL_INTERVAL));

    // Poll immediately on startup
    pollDeviceMetrics(device as any);
  }
}
