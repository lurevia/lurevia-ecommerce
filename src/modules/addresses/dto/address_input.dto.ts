import type {
    CreateAddressInput,
    UpdateAddressInput,
} from "../validator/addresses.validator";
import type { ProvinceMadagascar, RegionMadagascar } from "@prisma/client";

export class CreateAddressDto implements CreateAddressInput {
    label!: string;
    fullName!: string;
    phone!: string;
    email?: string;
    province!: ProvinceMadagascar;
    region!: RegionMadagascar;
    city!: string;
    neighborhood?: string;
    address!: string;
    latitude?: number;
    longitude?: number;
    accuracyMeters?: number;
    notes?: string;
    isDefault!: boolean;
    pickupPointId?: string;

    constructor(data: CreateAddressInput) {
        Object.assign(this, data);
    }
}

export class UpdateAddressDto implements UpdateAddressInput {
    label?: string;
    fullName?: string;
    phone?: string;
    email?: string;
    province?: ProvinceMadagascar;
    region?: RegionMadagascar;
    city?: string;
    neighborhood?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    accuracyMeters?: number;
    notes?: string;
    isDefault?: boolean;
    pickupPointId?: string;

    constructor(data: UpdateAddressInput) {
        Object.assign(this, data);
    }
}