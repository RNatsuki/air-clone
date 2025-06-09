import { Client } from "ssh2";
import { execCommand } from "../poller";


export async function pollSSID(conn: Client): Promise<{ ssid: string }> {
    const output = await execCommand(conn, `iwconfig ath0 | grep ESSID | awk -F':' '{print $2}' | tr -d '"' || echo 'Unknown SSID'`);
    const ssid = output.trim() || "Unknown SSID";
    return { ssid };
}
