import { Client } from "ssh2";
import { execCommand } from "../poller";


function parseUptime(uptime: string): number {
    return Math.floor(parseFloat(uptime));
  }

export async function pollUptime(conn: Client): Promise<{ uptime: number }> {
    const output = await execCommand(conn, `cut -d ' ' -f1 /proc/uptime`);
    const uptimeValue = parseUptime(output);
    return { uptime: uptimeValue };
}
