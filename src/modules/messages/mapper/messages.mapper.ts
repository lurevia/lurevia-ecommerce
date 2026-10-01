import { type MessageRow } from "../lib/type/messages.type";

export class MessagesMapper {
  toOutput(m: MessageRow) {
    return {
      id: m.id,
      type: m.type,
      subject: m.subject,
      body: m.body,
      read: m.read,
      readAt: m.readAt,
      createdAt: m.createdAt,
      sender: m.sender
        ? {
          id: m.sender.id,
          fullName: m.sender.fullName,
          avatarUrl: m.sender.avatarUrl,
          role: m.sender.role,
        }
        : null,
    };
  }

  toOutputList(items: MessageRow[]) {
    return items.map((item) => this.toOutput(item));
  }
}

export const messagesMapper = new MessagesMapper();
