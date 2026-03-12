import { BASE_URL } from "@/config/index.js";
import fs from "fs";
import path from "path";

/**
 * Recursively convert any BigInt properties to strings.
 */
export function bigintToStringDeep(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  // If it’s a BigInt, return it as string
  if (typeof obj === "bigint") {
    return obj.toString();
  }
  // If it’s an array, sanitize each element
  if (Array.isArray(obj)) {
    return obj.map((el) => bigintToStringDeep(el));
  }
  // If it’s a Date, just keep it (or you could toISOString() if you prefer)
  if (obj instanceof Date) {
    return obj;
  }
  // If it’s a plain object, loop its keys
  if (typeof obj === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = bigintToStringDeep(v);
    }
    return out;
  }
  // Primitive (string, number, boolean, etc.)
  return obj;
}

export const toRelativeImagePath = (absolutePath: string): string => {
  if (
    absolutePath.startsWith("http://") ||
    absolutePath.startsWith("https://")
  ) {
    return absolutePath;
  }
  const relativePath = absolutePath.replace(process.cwd(), "");
  return relativePath.startsWith(path.sep)
    ? relativePath
    : path.sep + relativePath;
};

export function toPublicImageUrl(filePath?: string | null): string | null {
  if (!filePath) return null;

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  const normalized = filePath.replace(/\\/g, "/");

  const urlPath = normalized.startsWith("/") ? normalized : "/" + normalized;

  return `${BASE_URL}${urlPath}`;
}

export const imageToBase64 = (imagePath: string) => {
  const image = fs.readFileSync(imagePath);
  return Buffer.from(image).toString("base64");
};

export type PrecisionKey =
  | "poPrecision"
  | "defaultPrecision"
  | "itemPrecision"
  | "sellPrecision"
  | "grnPrecision";

type Opts = {
  key: PrecisionKey;
  min?: number;
  max?: number;
  required?: boolean;
  strict?: boolean;
  exact?: boolean; // if true => exactly N decimals, else => at most N,
};

export function toArrayBuffer(buf: Buffer): ArrayBuffer {
  const uint8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  return uint8.slice().buffer;
}
