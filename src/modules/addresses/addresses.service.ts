import { addressesRepository } from "./addresses.repository";
import { ForbiddenError, NotFoundError } from "../../errors/AppError";
import type { AddressInput, UpdateAddressInput } from "./addresses.validators";

const assertOwnership = async (addressId: string, userId: string) => {
  const address = await addressesRepository.findById(addressId);
  if (!address) throw new NotFoundError("Adresse");
  if (address.userId !== userId) throw new ForbiddenError("Cette adresse ne vous appartient pas.");
  return address;
};

export const addressesService = {
  list: (userId: string) => addressesRepository.findManyByUser(userId),

  async create(userId: string, input: AddressInput) {
    const isFirstAddress = (await addressesRepository.countByUser(userId)) === 0;
    // La toute première adresse d'un utilisateur devient automatiquement
    // l'adresse par défaut, même si le client n'a pas explicitement coché la case.
    const isDefault = input.isDefault || isFirstAddress;

    if (isDefault) {
      await addressesRepository.clearDefaultForUser(userId);
    }

    return addressesRepository.create({
      ...input,
      isDefault,
      user: { connect: { id: userId } },
    });
  },

  async update(userId: string, addressId: string, input: UpdateAddressInput) {
    await assertOwnership(addressId, userId);

    if (input.isDefault) {
      await addressesRepository.clearDefaultForUser(userId, addressId);
    }

    return addressesRepository.update(addressId, input);
  },

  async remove(userId: string, addressId: string) {
    const address = await assertOwnership(addressId, userId);
    await addressesRepository.delete(addressId);

    // Si on supprime l'adresse par défaut, on en promeut une autre pour ne
    // jamais laisser l'utilisateur sans adresse par défaut alors qu'il en a.
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
