import { ConflictError } from "../../errors/AppError";
import { toProductDto } from "../products/products.mapper";
import type { cartRepository } from "./cart.repository";

export const assertProductPurchasable = (product: {
  isActive: boolean;
  pricingMode: string;
  stock: number;
  price: number | null;
}) => {
  if (!product.isActive) {
    throw new ConflictError("Ce produit n'est plus disponible.");
  }
  if (product.pricingMode === "AUCTION") {
    throw new ConflictError(
      "Ce produit est en enchère. Utilisez l'interface d'enchère pour y participer."
    );
  }
  if (product.pricingMode === "NEGOTIABLE") {
    throw new ConflictError(
      "Ce produit est négociable. Proposez un prix via l'interface de négociation."
    );
  }
  if (product.pricingMode === "ON_REQUEST") {
    throw new ConflictError(
      "Ce produit est sur demande. Contactez le vendeur pour obtenir un prix."
    );
  }
  if (product.price === null) {
    throw new ConflictError("Ce produit n'a pas de prix défini.");
  }
};

export const toCartResponse = (
  items: Awaited<ReturnType<typeof cartRepository.findByUser>>
) => {
  const dtoItems = items.map((item) => {
    const productDto = toProductDto(item.product);
    return {
      id: item.id,
      product: productDto,
      quantity: item.quantity,
      color: item.color,
      size: item.size,
      subtotal: (productDto.price ?? 0) * item.quantity,
    };
  });

  const totalItems = dtoItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = dtoItems.reduce((sum, i) => sum + i.subtotal, 0);

  return { items: dtoItems, totalItems, totalPrice };
};
