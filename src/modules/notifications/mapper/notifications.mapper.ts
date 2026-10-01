import type { Notification } from "@prisma/client";

export class NotificationsMapper {
  toOutput(n: Notification) {
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      actionUrl: n.actionUrl,
      imageUrl: n.imageUrl,
      read: n.read,
      readAt: n.readAt,
      createdAt: n.createdAt,
    };
  }

  toOutputList(items: Notification[]) {
    return items.map((item) => this.toOutput(item));
  }
}

export const notificationsMapper = new NotificationsMapper();
