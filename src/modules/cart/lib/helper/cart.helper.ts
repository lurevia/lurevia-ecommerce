import { ConflictError } from "../../../../errors/AppError";

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
