import { BASE_URL } from "@repo/shared/config/index.js";
import { DecodedToken } from "@/types/auth.js";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { Decimal } from "@prisma/client/runtime/client";

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

export const toImageApiUrl = (
  fileName: string,
  directoryPath: string
): string => {
  const baseUrl = BASE_URL;
  return `${baseUrl}/api/v1/common/image/${fileName}?path=${encodeURIComponent(
    directoryPath
  )}`;
};

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

export type RemoveUndefined<T> = {
  [K in keyof T as undefined extends T[K] ? K : K]: Exclude<T[K], undefined>;
};

export function omitUndefined<T extends object>(obj: T): RemoveUndefined<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as RemoveUndefined<T>;
}

export const processAndRecreateJWT = (
  token: string
): { permissions: string[]; roles: Record<string, string>[] } => {
  try {
    // Decode the existing JWT token
    const decoded = jwt.decode(token) as DecodedToken;

    //generate new time based UUID
    // const uuid = crypto.randomUUID();

    // Create a new object excluding irrelevant fields
    // const updatedObject = {
    //   id: decoded.id,
    //   username: decoded.username,
    //   email: decoded.email,
    //   contact_no: decoded.contact_no,
    //   role: decoded.role,
    //   uuid: uuid,
    //   // roles: decoded.,
    //   currentRoleid: decoded.currentRoleid,
    //   currency_symbol: decoded.currency_symbol,
    //   timezone: decoded.timezone,
    //   sch_name: decoded.sch_name,
    //   language: decoded.language,
    //   cc_lab_name: decoded.cc_lab_name,

    //   lab_code: decoded.lab_code,
    //   lab_type: decoded.lab_type,

    //   contact_email: decoded.contact_email,

    //   expire_at: decoded.expire_at,
    //   // permissions: decoded.permissions,
    //   API_TIME: decoded.API_TIME,
    //   expiry: decoded.expiry,
    // };

    // Create a new JWT token from the updated object
    // const newToken = jwt.sign(updatedObject, secret, { expiresIn: "3h" }); // You can adjust the expiry time as per your needs

    return { permissions: decoded.permissions, roles: decoded.roles };
  } catch (error) {
    throw new Error("Error processing the token: " + error);
  }
};

/**
 * Calculates age in years from the given date of birth.
 * @param dob - Date of birth as a string (YYYY-MM-DD) or Date object.
 * @returns Age in full years.
 */
export function calculateAge(dob: string | Date): number {
  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust if birthday hasn't occurred yet this year
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

export type DecimalToNumber<T> = T extends Decimal
  ? number
  : T extends (infer U)[]
  ? DecimalToNumber<U>[]
  : T extends object
  ? { [K in keyof T]: DecimalToNumber<T[K]> }
  : T;

export function toNumberDeep<T>(val: T): DecimalToNumber<T> {
  if (val === null || val === undefined) return val as any;
  if (val instanceof Decimal) return val.toNumber() as any;
  if (Array.isArray(val)) return val.map(toNumberDeep) as any;
  // If it’s a Date, just keep it (or you could toISOString() if you prefer)
  if (val instanceof Date) {
    return val as any;
  }
  if (typeof val === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(val as any)) out[k] = toNumberDeep(v);
    return out;
  }
  return val as any;
}
