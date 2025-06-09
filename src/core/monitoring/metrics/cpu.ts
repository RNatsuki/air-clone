import { Client } from "ssh2";
import { execCommand } from "../poller";


export async function pollCPU(conn: Client): Promise<{cpu: number}> {
    const output = await execCommand(conn, "cat /proc/stat | grep '^cpu '");
    const cpuData = output.split(/\s+/).slice(1, 5).map(Number);
    const idle = cpuData[3];
    const total = cpuData.reduce((acc, val) => acc + val, 0);
    const usage = ((total - idle) / total) * 100;
    return { cpu: Math.round(usage) };
}
