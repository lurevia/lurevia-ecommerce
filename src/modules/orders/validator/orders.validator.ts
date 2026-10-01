import { z } from "zod";
import { ProvinceMadagascar, RegionMadagascar } from "@prisma/client";
import { normalizeMalagasyPhone } from "../../../utils/phone";

// ─────────────────────────────────────────────────────────────────────────────
// SCHÉMAS DE BASE
// ─────────────────────────────────────────────────────────────────────────────

const phoneSchema = z
    .string()
    .trim()
    .transform((val, ctx) => {
        const normalized = normalizeMalagasyPhone(val);
        if (!normalized) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Numéro malgache invalide (ex : 034 12 345 67)",
            });
            return z.NEVER;
        }
        return normalized;
    });

const provinceSchema = z.nativeEnum(ProvinceMadagascar);
const regionSchema = z.nativeEnum(RegionMadagascar);

// ─────────────────────────────────────────────────────────────────────────────
// ADRESSE DE LIVRAISON (snapshot)
// ─────────────────────────────────────────────────────────────────────────────

const shippingSchema = z.object({
    fullName: z.string().trim().min(2).max(120),
    phone: phoneSchema,
    email: z.string().trim().toLowerCase().email(),
    province: provinceSchema,
    region: regionSchema,
    city: z.string().trim().min(1).max(100),
    neighborhood: z.string().trim().max(100).optional(),
    address: z.string().trim().min(3).max(255),
    notes: z.string().trim().max(500).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// CHECKOUT
// ─────────────────────────────────────────────────────────────────────────────

export const checkoutSchema = z
    .object({
        // Source de l'adresse
        addressId: z.string().uuid().optional(),
        shipping: shippingSchema.optional(),

        // Mode de livraison
        deliveryMode: z.enum(["HOME_DELIVERY", "PICKUP_POINT"]),

        // Point relais (si PICKUP_POINT)
        pickupPointId: z.string().uuid().optional(),

        // GPS (si HOME_DELIVERY, recommandé)
        deliveryLatitude: z.number().min(-90).max(90).optional(),
        deliveryLongitude: z.number().min(-180).max(180).optional(),
        deliveryAccuracy: z.number().positive().optional(),

        // Paiement
        paymentMethod: z.enum(["mobile-money", "card", "cash", "bank-transfer"]),
        mobileMoney: z
            .object({
                provider: z.enum(["mvola", "orange-money", "airtel-money"]),
                phoneNumber: phoneSchema,
            })
            .optional(),
        paymentToken: z.string().trim().max(500).optional(),
    })
    .superRefine((data, ctx) => {
        // Adresse requise (enregistrée OU saisie)
        if (!data.addressId && !data.shipping) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Une adresse enregistrée ou des informations de livraison sont requises.",
                path: ["addressId"],
            });
        }

        // PICKUP_POINT → pickupPointId obligatoire
        if (data.deliveryMode === "PICKUP_POINT" && !data.pickupPointId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Sélectionnez un point relais.",
                path: ["pickupPointId"],
            });
        }

        // HOME_DELIVERY → GPS recommandé (on tolère l'absence mais on avertit)
        if (
            data.deliveryMode === "HOME_DELIVERY" &&
            (data.deliveryLatitude === undefined) !== (data.deliveryLongitude === undefined)
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Latitude et longitude doivent être fournies ensemble.",
                path: ["deliveryLatitude"],
            });
        }

        // Mobile money → infos obligatoires
        if (data.paymentMethod === "mobile-money" && !data.mobileMoney) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Les informations Mobile Money sont requises.",
                path: ["mobileMoney"],
            });
        }

        // Card → jeton obligatoire (jamais de données carte brutes)
        if (data.paymentMethod === "card" && !data.paymentToken) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Le jeton de paiement est requis.",
                path: ["paymentToken"],
            });
        }
    });

// ─────────────────────────────────────────────────────────────────────────────
// PARAMS & QUERY
// ─────────────────────────────────────────────────────────────────────────────

export const orderIdParamsSchema = z.object({
    id: z.string().uuid("Identifiant de commande invalide"),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum([
        "pending", "paid", "shipped", "delivered", "cancelled",
        "cod-pending", "cod-failed", "refunded", "payment-failed",
        "PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED",
        "COD_PENDING", "COD_FAILED", "REFUNDED", "PAYMENT_FAILED",
    ]),
});

export const listOrdersQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
    status: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
