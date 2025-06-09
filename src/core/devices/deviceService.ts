import { prisma } from "../../db/client";
import { DiscoveredDevice } from "../discovery/ubntDiscovery";

export async function saveDevice(discovered: DiscoveredDevice, sshUsername: string, sshPassword: string) {
    return prisma.device.upsert({
        where: {mac: discovered.mac},
        update: {
            ip: discovered.ip,
            hostname: discovered.hostname,
            model: discovered.model,
            ssid: discovered.ssid,
            firmware: discovered.firmware,
            sshUsername,
            sshPassword,
            lastSeen: new Date(),
        },
        create: {
            mac: discovered.mac!,
            ip: discovered.ip,
            hostname: discovered.hostname,
            model: discovered.model,
            ssid: discovered.ssid,
            firmware: discovered.firmware,
            sshUsername,
            sshPassword,
            lastSeen: new Date(),
        },
    })
}

export async function updateDevice(mac: string, updateData: Partial<Omit<DiscoveredDevice, 'mac'>> & {sshUsername?: string, sshPassword?: string}) {
    return prisma.device.update({
        where: {mac},
        data: {
            ...updateData,
            lastSeen: new Date(),
        }
    })
}

export async function getDevices() {
    return prisma.device.findMany()
}

export async function getDevice(mac: string){
    return prisma.device.findUnique({where: {mac}})
}
