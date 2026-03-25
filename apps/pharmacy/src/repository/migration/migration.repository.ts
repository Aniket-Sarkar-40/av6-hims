import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { CreateMigrationInput } from "@/types/migration/migration.js";
import { Migration } from "@repo/db/generated/prisma/client";

export const createMigrationInDb = async (
  input: CreateMigrationInput,
): Promise<Migration> => {
  const store = requestStorage.getStore();
  return db.migration.create({
    data: {
      ...input,
      createdBy: store?.user?.id,
    },
  });
};
