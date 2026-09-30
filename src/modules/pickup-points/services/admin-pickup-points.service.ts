import { prisma } from "../../../lib/prisma";
import { ConflictError, NotFoundError } from "../../../errors/AppError";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import { pickupPointsRepository } from "../pickup-points.repository";
import { toPickupPointDto } from "../pickup-points.dto";
import type {
  CreatePickupPointInput,
  ListPickupPointsQuery,
  UpdatePickupPointInput,
} from "../pickup-points.validators";

export const adminPickupPointsService = {
  async list(query: ListPickupPointsQuery) {
    const pagination = normalizePagination(query.page, query.limit);

    const where = {
      ...(query.province ? { province: query.province } : {}),
      ...(query.region ? { region: query.region } : {}),
      ...(query.city
        ? { city: { contains: query.city, mode: "insensitive" as const } }
        : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" as const } },
              { provider: { contains: query.search, mode: "insensitive" as const } },
              { address: { contains: query.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, totalItems] = await pickupPointsRepository.findMany(
      where,
      (pagination.page - 1) * pagination.limit,
      pagination.limit
    );

    return buildPaginatedResult(
      items.map(toPickupPointDto),
      totalItems,
      pagination
    );
  },

  async getById(id: string) {
    const pickupPoint = await pickupPointsRepository.findById(id);
    if (!pickupPoint) throw new NotFoundError("Point relais");
    return toPickupPointDto(pickupPoint);
  },

  async create(input: CreatePickupPointInput) {
    const existing = await pickupPointsRepository.findByNameAndProvider(
      input.name,
      input.provider,
      input.city
    );
    if (existing) {
      throw new ConflictError(
        `Un point relais "${input.name}" (${input.provider}) existe déjà à ${input.city}.`
      );
    }

    if (input.shippingZoneId) {
      const zone = await prisma.shippingZone.findUnique({
        where: { id: input.shippingZoneId },
        select: { id: true },
      });
      if (!zone) throw new NotFoundError("Zone de livraison");
    }

    const pickupPoint = await pickupPointsRepository.create({
      name: input.name,
      provider: input.provider,
      phone: input.phone,
      email: input.email,
      province: input.province,
      region: input.region,
      city: input.city,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      isActive: input.isActive,
      ...(input.shippingZoneId
        ? { shippingZone: { connect: { id: input.shippingZoneId } } }
        : {}),
    });

    return toPickupPointDto(pickupPoint);
  },

  async update(id: string, input: UpdatePickupPointInput) {
    const pickupPoint = await pickupPointsRepository.findById(id);
    if (!pickupPoint) throw new NotFoundError("Point relais");

    if (
      (input.name && input.name !== pickupPoint.name) ||
      (input.provider && input.provider !== pickupPoint.provider) ||
      (input.city && input.city !== pickupPoint.city)
    ) {
      const nextName = input.name ?? pickupPoint.name;
      const nextProvider = input.provider ?? pickupPoint.provider;
      const nextCity = input.city ?? pickupPoint.city;

      const existing = await pickupPointsRepository.findByNameAndProvider(
        nextName,
        nextProvider,
        nextCity
      );
      if (existing && existing.id !== id) {
        throw new ConflictError(
          `Un point relais "${nextName}" (${nextProvider}) existe déjà à ${nextCity}.`
        );
      }
    }

    if (input.shippingZoneId) {
      const zone = await prisma.shippingZone.findUnique({
        where: { id: input.shippingZoneId },
        select: { id: true },
      });
      if (!zone) throw new NotFoundError("Zone de livraison");
    }

    const { shippingZoneId, ...rest } = input;

    const updated = await pickupPointsRepository.update(id, {
      ...rest,
      ...(shippingZoneId !== undefined && {
        shippingZone: shippingZoneId
          ? { connect: { id: shippingZoneId } }
          : { disconnect: true },
      }),
    });

    return toPickupPointDto(updated);
  },

  async remove(id: string) {
    const pickupPoint = await pickupPointsRepository.findById(id);
    if (!pickupPoint) throw new NotFoundError("Point relais");

    const addressesCount = pickupPoint._count?.addresses ?? 0;
    const ordersCount = pickupPoint._count?.orders ?? 0;

    if (addressesCount > 0 || ordersCount > 0) {
      throw new ConflictError(
        `Impossible de supprimer : ${addressesCount} adresse(s) et ${ordersCount} commande(s) utilisent ce point relais. Désactivez-le plutôt.`
      );
    }

    await pickupPointsRepository.delete(id);
  },
};
