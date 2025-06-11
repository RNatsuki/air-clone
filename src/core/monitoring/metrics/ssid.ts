import { Client } from "ssh2";
import { execCommand } from "../poller";


export async function pollSSID(data: string): Promise<{ ssid: string }> {
    const ssidData = data.split("\n").find(line => line.startsWith("essid="));
    if (ssidData) {
        const ssidValue = ssidData.split("=")[1].trim();
        return { ssid: ssidValue };
    }
    return { ssid: "" };
}
