import { z } from "zod";
import { ProductPricingMode, AuctionStatus } from "@prisma/client";

const csvToArray = (value: unknown): string[] | undefined => {
    if (typeof value !== "string" || value.trim() === "") return undefined;
    return value.split(",").map((v) => v.trim()).filter(Boolean);
};

const colorSchema = z.object({
    label: z.string().trim().min(1).max(60),
    hex: z
        .string()
        .trim()
        .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Code hex invalide"),
});

export const listProductsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(12),
    categories: z.preprocess(csvToArray, z.array(z.string()).optional()),
    sizes: z.preprocess(
        csvToArray,
        z.array(z.string().trim().min(1).max(60)).optional()
    ),
    colors: z.preprocess(csvToArray, z.array(z.string()).optional()),
    priceMin: z.coerce.number().int().nonnegative().optional(),
    priceMax: z.coerce.number().int().nonnegative().optional(),
    availability: z.enum(["all", "in-stock", "out-of-stock"]).default("all"),
    categoryId: z.string().uuid().optional(),
    priceRange: z.string().regex(/^\d+-\d+$/).optional(),
    stock: z.enum(["out", "low", "in", "high"]).optional(),
    status: z.enum(["new", "promo", "popular"]).optional(),
    sortBy: z
        .enum(["newest", "price-asc", "price-desc", "rating-desc", "popular"])
        .default("newest"),
    search: z.string().trim().max(150).optional(),
    pricingMode: z.nativeEnum(ProductPricingMode).optional(),
    auctionStatus: z.nativeEnum(AuctionStatus).optional(),
    ownerId: z.string().uuid().optional(),
});

export const productIdParamsSchema = z.object({
    id: z.string().uuid("Identifiant de produit invalide"),
});

export const productSlugParamsSchema = z.object({
    slug: z.string().trim().min(1).max(200),
});

export const searchSuggestionsQuerySchema = z.object({
    q: z.string().trim().min(1).max(150),
    limit: z.coerce.number().int().positive().max(20).default(6),
});

export const createProductSchema = z
    .object({
        title: z.string().trim().min(2).max(200),
        sku: z.string().trim().min(2).max(60),
        description: z.string().trim().max(500).optional(),
        longDescription: z.string().trim().max(5000).optional(),

        pricingMode: z.nativeEnum(ProductPricingMode).default("FIXED"),

        price: z.number().int().positive().optional(),
        originalPrice: z.number().int().positive().optional(),
        minPrice: z.number().int().positive().optional(),
        maxPrice: z.number().int().positive().optional(),

        auctionStartPrice: z.number().int().positive().optional(),
        auctionReservePrice: z.number().int().positive().optional(),
        auctionStartAt: z.coerce.date().optional(),
        auctionEndAt: z.coerce.date().optional(),

        stock: z.number().int().nonnegative().default(0),
        lowStockThreshold: z.number().int().nonnegative().default(5),
        isNew: z.boolean().default(false),
        isActive: z.boolean().default(true),

        tags: z.array(z.string().trim().max(40)).max(20).default([]),
        categoryIds: z
            .array(z.string().uuid())
            .min(1, "Au moins une catégorie est requise"),
        images: z
            .array(z.string().trim().min(1).max(2048))
            .min(1, "Au moins une image est requise"),
        colors: z.array(colorSchema).default([]),
        sizes: z.array(z.string().trim().min(1).max(60)).default([]),
    })
    .superRefine((data, ctx) => {
        if (data.pricingMode === "FIXED" && data.price === undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Un prix est requis pour un produit à prix fixe.",
                path: ["price"],
            });
        }

        if (data.pricingMode === "NEGOTIABLE") {
            if (data.minPrice === undefined || data.maxPrice === undefined) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "minPrice et maxPrice sont requis pour un produit négociable.",
                    path: ["minPrice"],
                });
            }
            if (
                data.minPrice !== undefined &&
                data.maxPrice !== undefined &&
                data.minPrice >= data.maxPrice
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "minPrice doit être strictement inférieur à maxPrice.",
                    path: ["maxPrice"],
                });
            }
        }

        // AUCTION → auctionStartPrice + auctionEndAt obligatoires
        if (data.pricingMode === "AUCTION") {
            if (data.auctionStartPrice === undefined) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Un prix de départ est requis pour une enchère.",
                    path: ["auctionStartPrice"],
                });
            }
            if (data.auctionEndAt === undefined) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Une date de fin est requise pour une enchère.",
                    path: ["auctionEndAt"],
                });
            }
            if (
                data.auctionEndAt &&
                data.auctionEndAt <= new Date()
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "La date de fin doit être dans le futur.",
                    path: ["auctionEndAt"],
                });
            }
            if (
                data.auctionReservePrice !== undefined &&
                data.auctionStartPrice !== undefined &&
                data.auctionReservePrice < data.auctionStartPrice
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Le prix de réserve doit être ≥ au prix de départ.",
                    path: ["auctionReservePrice"],
                });
            }
        }

        if (
            data.originalPrice !== undefined &&
            data.price !== undefined &&
            data.originalPrice <= data.price
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Le prix original doit être supérieur au prix actuel.",
                path: ["originalPrice"],
            });
        }
    });

export const updateProductSchema = createProductSchema.innerType().partial();

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type SearchSuggestionsQuery = z.infer<typeof searchSuggestionsQuerySchema>;
