import { prisma } from "../../../lib/prisma";
import type { Prisma } from "@prisma/client";
import { DEFAULT_ADDRESS_ORDER_BY } from "../lib/constant";

const pickupPointInclude = {
    pickupPoint: {
        select: { id: true, name: true, provider: true },
    },
} satisfies Prisma.AddressInclude;

export class AddressesRepository {
    async findManyByUser(userId: string) {
        return prisma.address.findMany({
            where: { userId },
            orderBy: DEFAULT_ADDRESS_ORDER_BY,
            include: pickupPointInclude,
        });
    }

    async findById(id: string) {
        return prisma.address.findUnique({
            where: { id },
            include: pickupPointInclude,
        });
    }

    async create(data: Prisma.AddressCreateInput) {
        return prisma.address.create({
            data,
            include: pickupPointInclude,
        });
    }

    async update(id: string, data: Prisma.AddressUpdateInput) {
        return prisma.address.update({
            where: { id },
            data,
            include: pickupPointInclude,
        });
    }

    async delete(id: string) {
        return prisma.address.delete({ where: { id } });
    }

    async clearDefaultForUser(userId: string, exceptId?: string) {
        return prisma.address.updateMany({
            where: {
                userId,
                isDefault: true,
                ...(exceptId ? { id: { not: exceptId } } : {}),
            },
            data: { isDefault: false },
        });
    }

    async countByUser(userId: string) {
        return prisma.address.count({ where: { userId } });
    }

    async findActivePickupPointById(id: string) {
        return prisma.pickupPoint.findFirst({
            where: { id, isActive: true },
            select: { id: true },
        });
    }
}

export const addressesRepository = new AddressesRepository();