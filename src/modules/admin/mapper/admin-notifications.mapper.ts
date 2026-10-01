export class AdminNotificationMapper {
  toOutput(n: {
    id: string;
    type: string;
    title: string;
    message: string;
    entityType: string;
    entityId: string;
    actorUserId: string | null;
    read: boolean;
    createdAt: Date;
  }) {
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      entityType: n.entityType,
      entityId: n.entityId,
      actorUserId: n.actorUserId ?? undefined,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    };
  }

  toOutputList(items: {
    id: string;
    type: string;
    title: string;
    message: string;
    entityType: string;
    entityId: string;
    actorUserId: string | null;
    read: boolean;
    createdAt: Date;
  }[]) {
    return items.map((item) => this.toOutput(item));
  }
}

export const adminNotificationMapper = new AdminNotificationMapper();
