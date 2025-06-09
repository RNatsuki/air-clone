import express from "express";
import { startDiscovery, DiscoveredDevice } from "../core/discovery/ubntDiscovery";
import {
  saveDevice,
  getDevices,
  getDevice,
  updateDevice,
} from "../core/devices/deviceService";

const router = express.Router();

const discovery = startDiscovery();

router.get("/discovery", async (req, res) => {
    const devices = await discovery.scanNow();
    res.json(devices);
});

router.get("/discovered", (req, res) => {
  const devices = discovery.getDiscoveredDevices();
  res.json(devices);
});


router.post("/accept", async (req, res) => {
  const { mac, sshUsername, sshPassword } = req.body;

  if (!mac || !sshUsername || !sshPassword) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const devices = discovery.getDiscoveredDevices();
  const device = devices.find((d: DiscoveredDevice) => d.mac === mac);
  if (!device) {
    res.status(404).json({ error: "Device not found" });
    return;
  }

  try {
    await saveDevice(device, sshUsername, sshPassword);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Error saving device" });
    return;
  }
});

router.get("/", async (req, res) => {
  const devices = await getDevices();
  res.json(devices);
});

router.get("/:mac", async (req, res) => {
    const { mac } = req.params;
    const device = await getDevice(mac);
    if (!device) {
        res.status(404).json({ error: "Device not found" });
        return;
    }
    res.json(device);
});

router.put("/:mac", async (req, res) => {
  const { mac } = req.params;
  const updateData = req.body;

  if (!updateData) {
    res.status(400).json({ error: "No data provided for update" });
    return;
  }

  try {
    const updatedDevice = await updateDevice(mac, updateData);
    res.json(updatedDevice);
  } catch (e) {
    res.status(500).json({ error: "Error updating device" });
  }
});


export default router;
