import { ForbiddenError, NotFoundError } from "../../../errors/AppError";
import {
    addressesRepository,
    type AddressesRepository,
} from "../repository/addresses.repository";
import type {
    CreateAddressInput,
    UpdateAddressInput,
} from "../dto";
import type { AddressWithPickup } from "../lib/type";

export class AddressesService {
    constructor(private readonly repository: AddressesRepository) { }

    async list(userId: string): Promise<AddressWithPickup[]> {
        return this.repository.findManyByUser(userId);
    }

    async getById(userId: string, addressId: string): Promise<AddressWithPickup> {
        return this.assertOwnership(addressId, userId);
    }

    async create(
        userId: string,
        input: CreateAddressInput
    ): Promise<AddressWithPickup> {
        await this.assertPickupPointActive(input.pickupPointId);

        const isFirstAddress = (await this.repository.countByUser(userId)) === 0;
        const shouldBeDefault = input.isDefault || isFirstAddress;

        if (shouldBeDefault) {
            await this.repository.clearDefaultForUser(userId);
        }

        return this.repository.create({
            ...input,
            isDefault: shouldBeDefault,
            user: { connect: { id: userId } },
            ...(input.pickupPointId && {
                pickupPoint: { connect: { id: input.pickupPointId } },
            }),
        });
    }

    async update(
        userId: string,
        addressId: string,
        input: UpdateAddressInput
    ): Promise<AddressWithPickup> {
        await this.assertOwnership(addressId, userId);
        await this.assertPickupPointActive(input.pickupPointId);

        if (input.isDefault) {
            await this.repository.clearDefaultForUser(userId, addressId);
        }

        const { pickupPointId, ...rest } = input;

        return this.repository.update(addressId, {
            ...rest,
            ...(pickupPointId !== undefined && {
                pickupPoint: pickupPointId
                    ? { connect: { id: pickupPointId } }
                    : { disconnect: true },
            }),
        });
    }

    async remove(userId: string, addressId: string): Promise<void> {
        const address = await this.assertOwnership(addressId, userId);
        await this.repository.delete(addressId);

        if (address.isDefault) {
            await this.promoteNextDefault(userId);
        }
    }

    async setDefault(
        userId: string,
        addressId: string
    ): Promise<AddressWithPickup> {
        await this.assertOwnership(addressId, userId);
        await this.repository.clearDefaultForUser(userId, addressId);
        return this.repository.update(addressId, { isDefault: true });
    }

    private async assertOwnership(
        addressId: string,
        userId: string
    ): Promise<AddressWithPickup> {
        const address = await this.repository.findById(addressId);
        if (!address) throw new NotFoundError("Adresse");
        if (address.userId !== userId) {
            throw new ForbiddenError("Cette adresse ne vous appartient pas.");
        }
        return address;
    }

    private async assertPickupPointActive(pickupPointId?: string): Promise<void> {
        if (!pickupPointId) return;
        const pickupPoint = await this.repository.findActivePickupPointById(
            pickupPointId
        );
        if (!pickupPoint) throw new NotFoundError("Point relais");
    }

    private async promoteNextDefault(userId: string): Promise<void> {
        const remaining = await this.repository.findManyByUser(userId);
        if (remaining.length === 0) return;
        await this.repository.update(remaining[0].id, { isDefault: true });
    }
}

export const addressesService = new AddressesService(addressesRepository);