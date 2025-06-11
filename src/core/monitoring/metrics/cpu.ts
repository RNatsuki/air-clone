import { Client } from "ssh2";
import { execCommand } from "../poller";


export async function pollCPU(data: string): Promise<{cpu: number}> {
    const cpuData = data.split("\n").find(line => line.startsWith("cpuUsage="));
    if (cpuData) {
        const cpuUsage = parseFloat(cpuData.split("=")[1]);
        return { cpu: Math.round(cpuUsage) };
    }
    return { cpu: 0 };
}
