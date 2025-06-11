// core/monitoring/pollingManager.ts
import { pollDeviceMetrics } from "./";
import { getDevices } from "../devices/deviceService";
import { emitDeviceStatus } from "../../socket";

const POLL_INTERVAL = 30_000; // 30s
const OFFLINE_THRESHOLD = 35_000; // 35s
const pollers = new Map<string, NodeJS.Timeout>();
const lastSeenMap = new Map<string, number>();

export async function startPolling() {
  const devices = await getDevices();
  for (const device of devices) {
    startPollingDevice(device.mac);
  }

  setInterval(checkOfflineDevices, 5000);
}

export async function startPollingDevice(device: any) {
  if (pollers.has(device.mac)) {
    // Si ya existe un poller para este dispositivo, detenerlo primero
    clearInterval(pollers.get(device.mac));
  }

  // Establecer el dispositivo como online inicialmente
  lastSeenMap.set(device.mac, Date.now());

  // Emitir un estado inicial para evitar el retraso de detección
  emitDeviceStatus(device.mac, true);

  // Crear nuevo poller
  pollers.set(device.mac, setInterval(() => {
    pollDeviceMetrics(device).then(() => {
      // Actualizar el timestamp de última vista cuando el polling es exitoso
      lastSeenMap.set(device.mac, Date.now());
    }).catch((error) => {
      console.error(`Error polling device ${device.mac}:`, error);
    });
  }, POLL_INTERVAL));

  // Hacer el primer polling inmediatamente
  try {
    await pollDeviceMetrics(device);
    // Actualizar el timestamp de última vista después del polling inicial exitoso
    lastSeenMap.set(device.mac, Date.now());
  } catch (error) {
    console.error(`Error en el polling inicial para el dispositivo ${device.mac}:`, error);
  }
}

export function stopPollingDevice(mac: string) {
  if (pollers.has(mac)) {
    clearInterval(pollers.get(mac));
    pollers.delete(mac);
    lastSeenMap.delete(mac);
  }
}

function checkOfflineDevices() {
  const now = Date.now();
  lastSeenMap.forEach((lastSeen, mac) => {
    const isOffline = now - lastSeen > OFFLINE_THRESHOLD;

    // Emitir el estado del dispositivo a través de WebSockets
    emitDeviceStatus(mac, !isOffline);
  });
}

export async function refreshPollingDevices() {
  // Detener todos los pollers actuales
  pollers.forEach((timer, mac) => {
    clearInterval(timer);
  });
  pollers.clear();
  lastSeenMap.clear();

  // Reiniciar el polling con la lista actualizada de dispositivos
  await startPolling();
}
