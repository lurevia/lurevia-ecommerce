import type {
    ProvinceMadagascar,
    RegionMadagascar,
} from "@prisma/client";

export type AddressOutput = {
    id: string;
    label: string;
    fullName: string;
    phone: string;
    email: string | null;
    province: ProvinceMadagascar;
    region: RegionMadagascar;
    city: string;
    neighborhood: string | null;
    address: string;
    latitude: number | null;
    longitude: number | null;
    accuracyMeters: number | null;
    notes: string | null;
    isDefault: boolean;
    pickupPoint: {
        id: string;
        name: string;
        provider: string;
    } | null;
    createdAt: Date;
    updatedAt: Date;
};