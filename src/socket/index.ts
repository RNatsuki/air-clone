import { Server as IOServer, Socket } from "socket.io";
import { pollDeviceMetrics } from "../core/monitoring/";
import { getDevices } from "../core/devices/deviceService";
import { getAllMetrics } from "../core/monitoring/metricStore";

import { logger } from "../lib/logger";
import { prisma } from "../db/client";

export function setupSocket(server: any) {
  const io = new IOServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", async (socket: Socket) => {
    logger.info("Client connected to socket.io");

    // Emitir métricas enriquecidas cada 1 segundo
    setInterval(async () => {
      const devices = await prisma.device.findMany();
      const now = Math.floor(Date.now() / 1000);

      const payload = devices.map((device) => {
        const lastSeen = device.lastSeen ?? 0;
        const lastSeenAgo = now - lastSeen;
        const online = lastSeenAgo < 35;

        return {
          mac: device.mac,
          ip: device.ip,
          model: device.model,
          hostname: device.hostname,
          firmware: device.firmware,
          lastSeenAgo,
          online,
        };
      });

      socket.emit("metrics", payload);
    }, 1000);

    const devices = await getDevices();

    for (const device of devices) {
      pollDeviceMetrics(device as any);

      setInterval(() => {
        pollDeviceMetrics(device as any);
      }, 30000); // Poll metrics every second
    }

    socket.on("disconnect", () => {
      logger.info("Client disconnected from socket.io");
    });
  });
}
