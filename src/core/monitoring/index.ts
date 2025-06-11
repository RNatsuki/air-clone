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
import { updateMetric } from "./metricStore";
import { execCommand } from "./poller";



const MAX_CONCURRENT_CONNECTIONS = 5;
const connectionLimiter = pLimit(MAX_CONCURRENT_CONNECTIONS);

let emitInterval: NodeJS.Timeout | null = null;


export async function pollDeviceMetrics(
  device: {
    mac: string;
    ip: string;
    hostname: string;
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
        `SSH connection failed for ${device.mac} (${device.ip}): ${(e as Error).message}`
      );
      return;
    }

    // Execute command to get someone metrics and pass output to the respective metric functions for parsing
    const output = await execCommand(conn, `mca-status`)

    try {
      const cpuMetrics = await cpu.pollCPU(output);
      const signalMetrics = await signal.pollSignal(output);
      const uptimeMetrics = await uptime.pollUptime(output);
      const ssidMetrics = await ssid.pollSSID(output);

      //This metrics are not available in mca-status, so we poll them separately
      const ipMetrics = await ip.pollIp(conn);
      const hostnameMetrics = await hostname.pollHostname(conn);

      const metrics = {
        cpu: cpuMetrics.cpu,
        signal: signalMetrics.signal,
        uptime: uptimeMetrics.uptime,
        ssid: ssidMetrics.ssid,
        ip: ipMetrics.ip,
        hostname: hostnameMetrics.hostname,
        lastSeen: Math.floor(Date.now() / 1000),
      };

      //Guardar métricas en DB
      const metric = await prisma.device.update({
        where: { mac: device.mac },
        data: metrics ,
        select: {
          mac: false,
          cpu: true,
          memory: true,
          uptime: true,
          signal: true,
          ssid: true,
          ip: true,
          hostname: true,
          lastSeen: true,
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
