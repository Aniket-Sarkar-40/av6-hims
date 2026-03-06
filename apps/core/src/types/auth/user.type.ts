import type { Prisma, UserStatus } from "@repo/db/generated/prisma/client";

export interface UserDto
  extends Prisma.UserGetPayload<{
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
