import { Client } from "ssh2";
import { execCommand } from "../poller";




export async function pollSignal(data: string): Promise<{ signal: number }> {
    const signalData = data.split("\n").find(line => line.startsWith("signal="));
    if (signalData) {
        const signalStrength = parseFloat(signalData.split("=")[1]);
        return { signal: Math.round(signalStrength) };
    }
    return { signal: 0 };
}
