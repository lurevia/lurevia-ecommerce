import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

export const usersRepository = {
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),
  update: (id: string, data: Prisma.UserUpdateInput) => prisma.user.update({ where: { id }, data }),
};
