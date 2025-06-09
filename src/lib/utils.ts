export function parseTLV(buffer: Buffer): { [key: string]: Buffer } {
  const result: { [key: string]: Buffer } = {};
  let offset = 0;

  while (offset < buffer.length) {
    const type = buffer[offset];
    const length = buffer[offset + 1];
    const value = buffer.slice(offset + 2, offset + 2 + length);
    result[type.toString()] = value;
    offset += 2 + length;
  }

  return result;
}

export function hexToMac(hex: string): string {
  return hex.match(/.{1,2}/g)?.join(':') ?? '';
}
