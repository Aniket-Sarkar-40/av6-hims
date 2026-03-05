import { prisma } from "@repo/db";

export async function listUsersRepository() {
  return prisma.user.findMany({
    orderBy: { id: "desc" },
  });
}
