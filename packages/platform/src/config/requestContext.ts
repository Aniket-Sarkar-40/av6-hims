import { AsyncLocalStorage } from "async_hooks";
import type { CoreSettings } from "@repo/db/generated/prisma/client";
type Store = {
  user?: {
    contactNo: string;
    email: string;
    userName: string;
    id: number;
    role: Record<string, string>;
    roles: Record<string, string>[];
  };
  perms?: Set<string>;
  traceId?: string;
  settings?: CoreSettings | null;
  token?: string;
  ccId?: number;
};

export const requestStorage = new AsyncLocalStorage<Store>();
