import { Client } from "ssh2";
import { execCommand } from "../poller";

export async function pollIp(conn: Client): Promise<{ ip: string }> {
  const output = await execCommand(
    conn,
    `(ifconfig br0 | grep 'inet addr' || ifconfig ath0 | grep 'inet addr') | awk -F'[: ]+' '{print $4}' | head -n1 || echo 'No IP found'`
  );
  const ip = output.trim() || "No IP found";
  return { ip };
}
