export interface ParsedDeviceData{
    mac?: string;
    ip?: string;
    firmware?: string;
    uptime?: string;
    hostname?: string;
    model?: string;
    ssid?: string;
}




export function parseTLVs(buffer:Buffer): ParsedDeviceData {
    const parsedData: ParsedDeviceData = {};
    let offset = 0;

    while (offset < buffer.length) {
        const type = buffer.readUInt8(offset);
        const length = buffer.readUInt8(offset + 1);
        const value = buffer.slice(offset + 2, offset + 2 + length).toString('utf-8');

        switch (type) {
            case 0x01: // Mac
                parsedData.mac = value;
                break;
            case 0x02: // IP
                parsedData.ip = value;
                break;
            case 0x03: // Firmware
                parsedData.firmware = value;
                break;
            case 0x0a: // Uptime
                parsedData.uptime = value;
                break;
            case 0x0b: // Hostname
                parsedData.hostname = value;
                break;
            case 0x0c: // Model
                parsedData.model = value;
                break;
            case 0x0d: // SSID
                parsedData.ssid = value;
                break;
            default:
                console.warn(`Unknown TLV type: ${type}`);
        }

        offset += 2 + length; // Move to the next TLV
    }

    return parsedData;
}
