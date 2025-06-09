import { Server as IOServer, Socket } from "socket.io";
import { pollDeviceMetrics } from "../core/monitoring/";
import { getDevices } from "../core/devices/deviceService";
import { logger } from "../lib/logger";

export function setupSocket(server: any) {
  const io = new IOServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", async (socket: Socket) => {
    logger.info("Client connected to socket.io");

    const devices = await getDevices();
    logger.info(`Discovered devices: ${JSON.stringify(devices)}`);
    for (const device of devices) {
      pollDeviceMetrics(device as any, socket);

      setInterval(() => pollDeviceMetrics(device as any, socket), 30000);
    }

    socket.on("disconnect", () => {
      logger.info("Client disconnected from socket.io");
    });
  });
}
