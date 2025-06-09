import { Client } from "ssh2";
import { execCommand } from "../poller";


function parseSignalStrength(signal: string): number {
    const match = /Signal level=(-?\d+) dBm/.exec(signal);
    return match ? parseInt(match[1], 10) : 0;
  }

export async function pollSignal(conn: Client): Promise<{ signal: number }> {
    const output = await execCommand(conn, `iwconfig 2>/dev/null | grep -i "signal level\\|quality" || echo "No iwconfig data"`);
    const signalStrength = parseSignalStrength(output);
    return { signal: signalStrength };
}
