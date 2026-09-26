import { z } from "zod";

const shippingSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, "Numéro de téléphone invalide"),
  email: z.string().trim().toLowerCase().email(),
  address: z.string().trim().min(3).max(255),
  city: z.string().trim().min(1).max(100),
  region: z.string().trim().min(1).max(100),
  notes: z.string().trim().max(500).optional(),
});

/**
 * Sécurité — aucune donnée de carte bancaire brute (numéro, CVV) n'est
 * jamais acceptée par cette API : ce serait une violation PCI-DSS majeure.
 * Pour "card", en production, le paiement doit être confirmé côté client
 * via un prestataire de paiement tiers (Stripe, etc.) qui renvoie un jeton
 * (`paymentToken`) opaque — jamais les données de carte elles-mêmes.
 */
export const checkoutSchema = z
  .object({
    addressId: z.string().uuid().optional(),
    shipping: shippingSchema.optional(),
    paymentMethod: z.enum(["mobile-money", "card", "cash"]),
    mobileMoney: z
      .object({
        provider: z.enum(["mvola", "orange-money", "airtel-money"]),
        phoneNumber: z.string().trim().regex(/^\+?[0-9\s-]{7,20}$/),
      })
      .optional(),
    paymentToken: z.string().trim().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.addressId && !data.shipping) {
      ctx.addIssue({
        code: "custom",
        message: "Une adresse enregistrée (addressId) ou des informations de livraison sont requises",
        path: ["addressId"],
      });
    }
    if (data.paymentMethod === "mobile-money" && !data.mobileMoney) {
      ctx.addIssue({
        code: "custom",
        message: "Les informations Mobile Money sont requises pour ce mode de paiement",
        path: ["mobileMoney"],
      });
    }
  });

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
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
