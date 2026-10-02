import type { AddressOutput } from "../dto";
import type { AddressWithPickup } from "../lib/type";

/**
 * Transformateur : AddressWithPickup (Prisma + relations) → AddressOutput (contrat HTTP).
 *
 * Responsabilité unique : traduire une entité interne en DTO de sortie.
 * Ne fait AUCUN appel DB, AUCUNE règle métier.
 */
export class AddressMapper {
  toOutput(address: AddressWithPickup): AddressOutput {
    return {
      id: address.id,
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      email: address.email,
      province: address.province,
      region: address.region,
      city: address.city,
      neighborhood: address.neighborhood,
      address: address.address,
      latitude: address.latitude,
      longitude: address.longitude,
      accuracyMeters: address.accuracyMeters,
      notes: address.notes,
      isDefault: address.isDefault,
      pickupPoint: address.pickupPoint
        ? {
            id: address.pickupPoint.id,
            name: address.pickupPoint.name,
            provider: address.pickupPoint.provider,
          }
        : null,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }

  toOutputList(addresses: AddressWithPickup[]): AddressOutput[] {
    return addresses.map((address) => this.toOutput(address));
  }
}

export const addressMapper = new AddressMapper();