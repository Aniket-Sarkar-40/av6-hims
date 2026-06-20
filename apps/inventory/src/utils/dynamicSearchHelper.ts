import { Prisma } from "@repo/db/generated/prisma/client";

function isPrismaDecimal(val: any): val is Prisma.Decimal {
  // Prisma.Decimal is decimal.js underneath; this is the most reliable check
  return Prisma.Decimal.isDecimal(val);
}

// OPTIONAL: if some decimals come as string-like objects
function isDecimalLike(val: any): boolean {
  return (
    val &&
    typeof val === "object" &&
    typeof val.toString === "function" &&
    typeof (val as any).toFixed === "function" &&
    typeof (val as any).toNumber === "function"
  );
}

/**
 * Recursively convert any BigInt and decimal properties to strings or number.
 */
export function bigintToStringDeep(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  // If it’s a BigInt, return it as string
  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (isPrismaDecimal(obj) || isDecimalLike(obj)) {
    // Choose ONE:
    // return obj.toNumber();        // keeps old "number" usage (may lose some precision in JS)
    return Number(obj); // safest for Redis + preserves 5 dp (string)
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
