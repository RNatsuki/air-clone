import { Server as IOServer, Socket } from "socket.io";
import { pollDeviceMetrics } from "../core/monitoring/";
import { getDevices } from "../core/devices/deviceService";
import { getAllMetrics } from "../core/monitoring/metricStore";

import { logger } from "../lib/logger";

export function setupSocket(server: any) {
  const io = new IOServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", async (socket: Socket) => {
    logger.info("Client connected to socket.io");

    //emitir metricas cada 1 segundo
    const interval = setInterval(() => {
      const metrics = getAllMetrics();
      socket.emit("metrics", metrics);
    }, 1000); // Emit metrics every second

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
