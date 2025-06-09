import dgram from "dgram";
import { logger } from "../../lib/logger";

export interface DiscoveredDevice {
  mac: string;
  ip: string;
  hostname?: string;
  model?: string;
  ssid?: string;
  firmware?: string;
  uptime?: number;
  lastSeen: Date;
}

const devicesCache = new Map<string, DiscoveredDevice>();

const DISCOVERY_PORT = 10001;
const BROADCAST_ADDR = "255.255.255.255";
const DISCOVERY_PACKET = Buffer.from("01000000", "hex");

// UBNT TLV field types (hex string keys)
const UBNT_MAC = "01";
const UBNT_MAC_AND_IP = "02";
const UBNT_FIRMWARE = "03";
const UBNT_RADIONAME = "0b";
const UBNT_MODEL_SHORT = "0c";
const UBNT_ESSID = "0d";
const UBNT_MODEL_FULL = "14";

function bufferToMac(buffer: Buffer) {
  return [...buffer]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(":")
    .toUpperCase();
}

function parseTLVs(payload: Buffer, remoteIp: string) {
  const data: Partial<DiscoveredDevice> = {};

  if (payload.length < 4) return data;

  // Validate UBNT discovery reply signature 01 00 00
  if (payload[0] !== 0x01 || payload[1] !== 0x00 || payload[2] !== 0x00) return data;

  let pointer = 3; // The 4th byte is remaining length
  let remaining = payload[pointer];
  pointer++;

  // remaining -= 1 because the Python code does that too
  remaining -= 1;

  while (remaining > 0 && pointer < payload.length) {
    const fieldType = payload[pointer].toString(16).padStart(2, "0");
    pointer++;
    remaining--;

    if (pointer + 1 >= payload.length) break;

    const fieldLen = payload.readUInt16BE(pointer);
    pointer += 2;
    remaining -= 2;

    if (pointer + fieldLen > payload.length) break;

    const fieldData = payload.slice(pointer, pointer + fieldLen);
    pointer += fieldLen;
    remaining -= fieldLen;

    switch (fieldType) {
      case UBNT_MAC:
        data.mac = bufferToMac(fieldData);
        break;
      case UBNT_MAC_AND_IP:
        data.mac = bufferToMac(fieldData.slice(0, 6));
        if (fieldData.length >= 10) {
          data.ip = remoteIp || fieldData.slice(6, 10).join(".");
        }
        break;
      case UBNT_FIRMWARE:
        data.firmware = fieldData.toString("utf8");
        break;
      case UBNT_RADIONAME:
        data.hostname = fieldData.toString("utf8");
        break;
      case UBNT_MODEL_SHORT:
        data.model = fieldData.toString("utf8");
        break;
      case UBNT_MODEL_FULL:
        if (!data.model) data.model = fieldData.toString("utf8");
        break;
      case UBNT_ESSID:
        data.ssid = fieldData.toString("utf8");
        break;
      default:
        // ignore unknown fields
        break;
    }
  }
  logger.info(`Parsed TLVs: ${JSON.stringify(data)}`);
  return data;
}

export function startDiscovery(intervalMs = 30000) {
  const socket = dgram.createSocket("udp4");

  socket.on("listening", () => {
    socket.setBroadcast(true);
    const address = socket.address();
    logger.info(`Discovery socket listening on ${address.address}:${address.port} and broadcast enabled`);
  });

  socket.on("message", (msg, rinfo) => {
    logger.info(`Received ${msg.length} bytes from ${rinfo.address}:${rinfo.port}: ${msg.toString("hex")}`);

    const data = parseTLVs(msg, rinfo.address);
    if (!data.mac) {
      logger.info("No MAC found in payload, ignoring");
      return;
    }

    const now = new Date();
    const prev = devicesCache.get(data.mac);

    devicesCache.set(data.mac, {
      mac: data.mac,
      ip:  rinfo.address,
      hostname: data.hostname || prev?.hostname,
      model: data.model || prev?.model,
      ssid: data.ssid || prev?.ssid,
      firmware: data.firmware || prev?.firmware,
      uptime: data.uptime || prev?.uptime,
      lastSeen: now,
    });

    logger.info(`Discovered device: ${data.mac} (${data.ip || rinfo.address})`);
  });

  socket.on("error", (err) => {
    logger.error(`Socket error: ${err.message}`);
    socket.close();
  });

  // Bind to a random available port to avoid conflict with 10001 port
  socket.bind(() => {
    broadcast();
  });

  function broadcast() {
    socket.send(
      DISCOVERY_PACKET,
      0,
      DISCOVERY_PACKET.length,
      DISCOVERY_PORT,
      BROADCAST_ADDR,
      (err) => {
        if (err) logger.error(`Discovery broadcast error: ${err.message}`);
        else logger.info("Discovery broadcast sent");
      }
    );
  }

  const interval = setInterval(broadcast, intervalMs);

  return {
    stop: () => {
      clearInterval(interval);
      socket.close();
    },
    getDiscoveredDevices: () => Array.from(devicesCache.values()),
  };
}
