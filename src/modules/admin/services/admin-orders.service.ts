import type { OrderStatus, PaymentMethod } from "@prisma/client";
import { adminRepository } from "../admin.repository";
import {
  toOrderDto,
  ORDER_STATUS_FROM_API,
  PAYMENT_METHOD_FROM_API,
} from "../../orders/orders.mapper";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import { NotFoundError } from "../../../errors/AppError";
import type { ListOrdersQuery } from "../admin.validators";

export const adminOrdersService = {
  async listOrders(query: ListOrdersQuery) {
    const pagination = normalizePagination(query.page, query.limit);
    const [orders, totalItems] = await adminRepository.findManyOrders({
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      status: query.status
        ? (ORDER_STATUS_FROM_API[query.status] ??
            (query.status.toUpperCase() as OrderStatus))
        : undefined,
      paymentMethod: query.paymentMethod
        ? (PAYMENT_METHOD_FROM_API[
            query.paymentMethod as keyof typeof PAYMENT_METHOD_FROM_API
          ] ??
            (query.paymentMethod
              .toUpperCase()
              .replaceAll("-", "_") as PaymentMethod))
        : undefined,
      search: query.search,
    });
    return buildPaginatedResult(orders.map(toOrderDto), totalItems, pagination);
  },

  async getOrder(id: string) {
    const order = await adminRepository.findOrderById(id);
    if (!order) throw new NotFoundError("Commande");
    return toOrderDto(order);
  },
};
