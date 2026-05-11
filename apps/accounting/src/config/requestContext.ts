import { CurrentMapping } from "@/types/auth/auth.js";
import { AccSettings } from "@repo/db/generated/prisma/client";
import { AsyncLocalStorage } from "async_hooks";

type Store = {
  user?: {
    contactNo?: string;
    email?: string;
    userName: string;
    id: number;
    role: Record<string, string> | CurrentMapping | null;
    roles?: Record<string, string>[];
  };
  perms?: Set<string>;
  traceId?: string;
  settings?: AccSettings | null;
  token?: string;
  auth?: boolean;
  level1Id?: number;
  level2Id?: number;
  defaultPrecision?: number | null;
};

export const requestStorage = new AsyncLocalStorage<Store>();
