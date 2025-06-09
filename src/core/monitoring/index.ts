import { prisma } from "../../db/client";
import { connectSSH } from "./poller";
import * as cpu from "./metrics/cpu";
import * as signal from "./metrics/signal";
import * as uptime from "./metrics/uptime";
import * as ssid from "./metrics/ssid";
import * as ip from "./metrics/ip";
import * as hostname from "./metrics/hostname";
import { logger } from "../../lib/logger";
import { Socket } from "socket.io";
import pLimit from "p-limit";
import { addMetricToBatch } from "./metricEmmiter";
import { updateMetric } from "./metricStore";



const MAX_CONCURRENT_CONNECTIONS = 5;
const connectionLimiter = pLimit(MAX_CONCURRENT_CONNECTIONS);

let emitInterval: NodeJS.Timeout | null = null;


export async function pollDeviceMetrics(
  device: {
    mac: string;
    ip: string;
    sshUsername: string;
    sshPassword: string;
  },
  socket?: Socket
) {
  return connectionLimiter(async () => {
    let conn;
    try {
      conn = await connectSSH(
        device.ip,
        device.sshUsername,
        device.sshPassword
      );
    } catch (e) {
      logger.error(
        `SSH connection failed for ${device.mac}: ${(e as Error).message}`
      );
      return;
    }

    try {
      const cpuMetrics = await cpu.pollCPU(conn);
      const signalMetrics = await signal.pollSignal(conn);
      const uptimeMetrics = await uptime.pollUptime(conn);
      const ssidMetrics = await ssid.pollSSID(conn);
      const ipMetrics = await ip.pollIp(conn);
      const hostnameMetrics = await hostname.pollHostname(conn);

      const metrics = {
        cpu: cpuMetrics.cpu,
        signal: signalMetrics.signal,
        uptime: uptimeMetrics.uptime,
        ssid: ssidMetrics.ssid,
        ip: ipMetrics.ip,
        hostname: hostnameMetrics.hostname,
      };

      //Guardar metricas en DB
      const metric = await prisma.device.update({
        where: { mac: device.mac },
        data: metrics,
        select: {
          mac: false,
          cpu: true,
          memory: true,
          uptime: true,
          signal: true,
          ssid: true,
          ip: true,
          hostname: true,
        },
      });

      updateMetric(device.mac, metric);
    } catch (error) {
      logger.error(
        `Error polling metrics for ${device.mac}: ${(error as Error).message}`
      );
    } finally {
      conn.end();
    }
  });
}
