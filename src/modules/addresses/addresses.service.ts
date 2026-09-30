import { addressesRepository } from "./addresses.repository";
import { ForbiddenError, NotFoundError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import type { AddressInput, UpdateAddressInput } from "./addresses.validators";

const assertOwnership = async (addressId: string, userId: string) => {
  const address = await addressesRepository.findById(addressId);
  if (!address) throw new NotFoundError("Adresse");
  if (address.userId !== userId) {
    throw new ForbiddenError("Cette adresse ne vous appartient pas.");
  }
  return address;
};

const assertPickupPointExists = async (pickupPointId?: string) => {
  if (!pickupPointId) return;
  const pickupPoint = await prisma.pickupPoint.findUnique({
    where: { id: pickupPointId },
    select: { id: true, isActive: true },
  });
  if (!pickupPoint || !pickupPoint.isActive) {
    throw new NotFoundError("Point relais");
  }
};

export const addressesService = {
  list: (userId: string) => addressesRepository.findManyByUser(userId),

  async getById(userId: string, addressId: string) {
    return assertOwnership(addressId, userId);
  },

  async create(userId: string, input: AddressInput) {
    await assertPickupPointExists(input.pickupPointId);

    const isFirstAddress =
      (await addressesRepository.countByUser(userId)) === 0;
    const isDefault = input.isDefault || isFirstAddress;

    if (isDefault) {
      await addressesRepository.clearDefaultForUser(userId);
    }

    return addressesRepository.create({
      ...input,
      isDefault,
      user: { connect: { id: userId } },
      ...(input.pickupPointId && {
        pickupPoint: { connect: { id: input.pickupPointId } },
      }),
    });
  },

  async update(
    userId: string,
    addressId: string,
    input: UpdateAddressInput
  ) {
    await assertOwnership(addressId, userId);
    await assertPickupPointExists(input.pickupPointId);

    if (input.isDefault) {
      await addressesRepository.clearDefaultForUser(userId, addressId);
    }
    const { pickupPointId, ...rest } = input;

    return addressesRepository.update(addressId, {
      ...rest,
      ...(pickupPointId !== undefined && {
        pickupPoint: pickupPointId
          ? { connect: { id: pickupPointId } }
          : { disconnect: true },
      }),
    });
  },

  async remove(userId: string, addressId: string) {
    const address = await assertOwnership(addressId, userId);
    await addressesRepository.delete(addressId);

    if (address.isDefault) {
      const remaining = await addressesRepository.findManyByUser(userId);
      if (remaining.length > 0) {
        await addressesRepository.update(remaining[0].id, { isDefault: true });
      }
    }
  },

  async setDefault(userId: string, addressId: string) {
    await assertOwnership(addressId, userId);
    await addressesRepository.clearDefaultForUser(userId, addressId);
    return addressesRepository.update(addressId, { isDefault: true });
  },
};