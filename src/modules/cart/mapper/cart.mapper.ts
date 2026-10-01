import type { cartRepository } from "../repository/cart.repository";
import { productsMapper } from "../../products/mapper/products.mapper";

export class CartMapper {
  toOutput(items: Awaited<ReturnType<typeof cartRepository.findByUser>>) {
    const dtoItems = items.map((item) => {
      const productDto = productsMapper.toOutput(item.product);
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
  }

}

export const cartMapper = new CartMapper();
