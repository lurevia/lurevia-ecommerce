import type { OrderStatus, PaymentMethod } from "@prisma/client";
import { adminRepository, type AdminRepository } from "../repository/admin.repository";
import { buildPaginatedResult, normalizePagination } from "../../../utils/pagination";
import { NotFoundError } from "../../../errors/AppError";
import type { ListOrdersQuery } from "../dto";
import { ordersMapper } from "../../orders/mapper/orders.mapper";
import { ORDER_STATUS_FROM_API, PAYMENT_METHOD_FROM_API } from "../../orders/lib/constant/orders.constant";

export class AdminOrdersService {
    constructor(
        private readonly repository: AdminRepository
    ) { }

    async listOrders(query: ListOrdersQuery) {
        const pagination = normalizePagination(query.page, query.limit);
        const [orders, totalItems] = await this.repository.findManyOrders({
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
        return buildPaginatedResult(ordersMapper.toOutputList(orders), totalItems, pagination);
    }

    async getOrder(id: string) {
        const order = await this.repository.findOrderById(id);
        if (!order) throw new NotFoundError("Commande");
        return ordersMapper.toOutput(order);
    }
}

export const adminOrdersService = new AdminOrdersService(adminRepository);
