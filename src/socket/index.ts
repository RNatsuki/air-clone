import { Server as IOServer, Socket } from "socket.io";
import { logger } from "../lib/logger";
import { prisma } from "../db/client";

let io: IOServer | null = null;
let metricsEmitterInterval: NodeJS.Timeout | null = null;

export function setupSocket(server: any) {
  if (io) return; // evitar reinicialización si ya está activo

  io = new IOServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  startMetricsEmitter();
}

function startMetricsEmitter() {
  if (metricsEmitterInterval) return; // evitar múltiples emisores

  metricsEmitterInterval = setInterval(async () => {
    try {
      const devices = await prisma.device.findMany();
      const now = Math.floor(Date.now() / 1000);

      const payload = devices.map((device) => {
        const lastSeenAgo = now - (device.lastSeen ?? 0);
        return {
          mac: device.mac,
          ip: device.ip,
          model: device.model,
          hostname: device.hostname,
          firmware: device.firmware,
          lastSeenAgo,
          ssid: device.ssid,
          signalStrength: device.signal,
          online: lastSeenAgo < 35,
        };
      });

      if (io) {
        io.emit("metrics", payload);
      }
    } catch (error: any) {
      logger.error(`Error emitting metrics: ${error.message}`);
    }
  }, 1000); // Emitir cada segundo
}
