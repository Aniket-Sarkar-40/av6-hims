import {
  Migration_Ref_Type,
  Migration_Type,
  Prisma,
} from "@repo/db/generated/prisma/client";

export type CreateMigrationReq = {
  refType: Migration_Ref_Type;
  refNo: string;
  migrationType: Migration_Type;
};

export type CreateMigrationInput = Prisma.MigrationCreateInput;
