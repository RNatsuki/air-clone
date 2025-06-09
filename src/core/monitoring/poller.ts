import { Client } from "ssh2"
import { logger } from "../../lib/logger"


export function connectSSH(ip: string, username:string, password: string): Promise<Client> {
    return new Promise((resolve, reject) =>{
        const conn = new Client();
        conn.on('ready',() => resolve(conn))
        conn.on('error', reject)
        conn.connect({
            host: ip,
            username: username,
            password: password,
            readyTimeout: 5000
        })
    })
}


export function execCommand(conn: Client, cmd: string): Promise<string>{
    return new Promise((resolve, reject) => {
        conn.exec(cmd, (err, stream) =>{
            if(err) return reject(err);
            let output = '';
            stream.on('data', (chunk: Buffer) => (output += chunk.toString()))
            stream.stderr.on('data', chunk => logger.warn(`SSH Error: ${chunk.toString()}`))
            stream.on('close', () => resolve(output.trim()))
        })
    })
}
