import { Server as IOServer, Socket } from "socket.io";
import { pollDeviceMetrics } from "../core/monitoring/";
import { getDevices } from "../core/devices/deviceService";
import { startMetricEmitter, stopMetricEmitter } from "../core/monitoring/metricEmmiter";

import { logger } from "../lib/logger";

export function setupSocket(server: any) {
  const io = new IOServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", async (socket: Socket) => {
    logger.info("Client connected to socket.io");

    startMetricEmitter(socket);


    const devices = await getDevices();
    logger.info(`Discovered devices: ${JSON.stringify(devices)}`);
    for (const device of devices) {
      //Realiza el monireo inmediato
      pollDeviceMetrics(device as any, socket);
      //Configura el polling cada 30 segundos
      setInterval(() => pollDeviceMetrics(device as any, socket), 30000);
    }

    socket.on("disconnect", () => {
      logger.info("Client disconnected from socket.io");
    });
  });
}
