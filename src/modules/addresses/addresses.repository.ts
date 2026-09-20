import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

export const addressesRepository = {
  findManyByUser: (userId: string) =>
    prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),

  findById: (id: string) => prisma.address.findUnique({ where: { id } }),

  create: (data: Prisma.AddressCreateInput) => prisma.address.create({ data }),

  update: (id: string, data: Prisma.AddressUpdateInput) =>
    prisma.address.update({ where: { id }, data }),

  delete: (id: string) => prisma.address.delete({ where: { id } }),

  clearDefaultForUser: (userId: string, exceptId?: string) =>
    prisma.address.updateMany({
      where: { userId, isDefault: true, ...(exceptId ? { id: { not: exceptId } } : {}) },
      data: { isDefault: false },
    }),

  countByUser: (userId: string) => prisma.address.count({ where: { userId } }),
};
