import { prisma } from "../../db/client";
import { connectSSH } from "./poller";
import * as cpu from "./metrics/cpu";
import { logger } from "../../lib/logger";
import { Socket } from "socket.io";

export async function pollDeviceMetrics(
  device: {
    mac: string;
    ip: string;
    sshUsername: string;
    sshPassword: string;
  },
  socket?: Socket
) {
  let conn;
  try {
    conn = await connectSSH(device.ip, device.sshUsername, device.sshPassword);
  } catch (e) {
    logger.error(
      `SSH connection failed for ${device.mac}: ${(e as Error).message}`
    );
    return;
  }

  try {
    const cpuMetrics = await cpu.pollCPU(conn);

    //Guardar metricas en DB
    const metric = await prisma.metric.create({
      data: {
        deviceMac: device.mac,
        cpu: cpuMetrics.cpu,
      },
    });

    // Emitir evento a través del socket si está disponible
    if (socket) {
      socket.emit("metrics", { deviceMac: device.mac, metric });
    }
  } catch (error) {
    logger.error(
      `Error polling metrics for ${device.mac}: ${(error as Error).message}`
    );
  } finally {
    conn.end();
  }
}
