import { Client } from "ssh2";
import { execCommand } from "../poller";



export async function pollUptime(data: string): Promise<{ uptime: number }> {
    const uptimeData = data.split("\n").find(line => line.startsWith("uptime="));
    if (uptimeData) {
        const uptimeValue = parseFloat(uptimeData.split("=")[1]);
        return { uptime: Math.floor(uptimeValue) };
    }
    return { uptime: 0 };
}
