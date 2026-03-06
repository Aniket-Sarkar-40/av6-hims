import { prisma } from "@repo/db";
import type { User } from "@repo/db/generated/prisma/client";

export async function getUserById(id: number): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function listUsersRepository(): Promise<User[]> {
  return prisma.user.findMany({
    orderBy: { id: "desc" },
  });
}
