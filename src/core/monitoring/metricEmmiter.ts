import { Socket } from "socket.io";

const metricBatch: { deviceMac: string; metric: any }[] = [];
let emitInterval: NodeJS.Timeout | null = null;

export function addMetricToBatch(deviceMac: string, metric: any) {
  metricBatch.push({ deviceMac, metric });
}

function sendMetricsBatch(socket: Socket) {
  if (metricBatch.length === 0) return;

  const batch = [...metricBatch];
  metricBatch.length = 0;

  socket.emit("metrics_batch", batch); // <-- aquí se envía al frontend
}

export function startMetricEmitter(socket: Socket) {
  if (emitInterval) clearInterval(emitInterval);

  emitInterval = setInterval(() => {
    sendMetricsBatch(socket);
  }, 1000); // cada 1 segundo
}

export function stopMetricEmitter() {
  if (emitInterval) {
    clearInterval(emitInterval);
    emitInterval = null;
  }
}
