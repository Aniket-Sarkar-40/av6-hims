import { prisma } from "@repo/db";
import { CoreSettings } from "@repo/db/generated/prisma/client";
export async function getUserById(id: number): Promise<CoreSettings | null> {
  return prisma.coreSettings.findUnique({
    where: { id },
  });
}
