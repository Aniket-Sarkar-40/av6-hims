import { Prisma } from "@repo/db/generated/prisma/client";
import { UserStatus } from "@repo/db/generated/prisma/enums.js";

export interface UserDto
  extends Prisma.CoreSettingsGetPayload<{
    select: {
      id: true;
    };
  }> {
  id: number;
  name: string;
  email: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}
