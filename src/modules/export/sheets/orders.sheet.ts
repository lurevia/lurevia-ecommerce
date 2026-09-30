import type { Workbook } from "exceljs";
import { formatAriary } from "../../../utils/currency";
import { boldHeader, toDateStr } from "../export.helpers";

export interface OrderExportItem {
  titleSnapshot: string;
  quantity: number;
  priceSnapshot: number;
}

export interface OrderExportRecord {
  orderNumber: string;
  createdAt: Date | string;
  status: string;
  paymentMethod: string;
  deliveryMode: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  items: OrderExportItem[];
}

export function buildOrdersSheet(workbook: Workbook, orders: OrderExportRecord[]) {
  const orderSheet = workbook.addWorksheet("Commandes");
  orderSheet.columns = [
    { header: "N° commande", key: "orderNumber", width: 22 },
    { header: "Date", key: "date", width: 20 },
    { header: "Statut", key: "status", width: 15 },
    { header: "Paiement", key: "paymentMethod", width: 15 },
    { header: "Livraison", key: "deliveryMode", width: 15 },
    { header: "Sous-total", key: "subtotal", width: 15 },
    { header: "Frais livraison", key: "shippingCost", width: 15 },
    { header: "Total", key: "total", width: 15 },
    { header: "Produits", key: "products", width: 60 },
  ];

  orders.forEach((o) => {
    const productList = o.items
      .map(
        (it) =>
          `${it.titleSnapshot} (x${it.quantity}) — ${formatAriary(it.priceSnapshot)}`
      )
      .join(" | ");
    orderSheet.addRow({
      orderNumber: o.orderNumber,
      date: toDateStr(o.createdAt),
      status: o.status,
      paymentMethod: o.paymentMethod,
      deliveryMode: o.deliveryMode,
      subtotal: o.subtotal,
      shippingCost: o.shippingCost,
      total: o.total,
      products: productList,
    });
  });
  boldHeader(orderSheet);
}
