import { Client } from "ssh2";
import { execCommand } from "../poller";

export async function pollHostname(conn: Client): Promise<{ hostname: string }> {
  const output = await execCommand(
    conn,
    `uname -n || hostname || echo 'Unknown Hostname'`
  );
  const hostname = output.trim() || "Unknown Hostname";
  return { hostname };
}
