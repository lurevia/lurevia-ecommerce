export const shortOrderRef = (order: { orderNumber: string; id: string; }) =>
  order.orderNumber ?? order.id.slice(-8).toUpperCase();
