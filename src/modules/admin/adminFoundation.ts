import { prisma } from "../../lib/prisma";
import { ConflictError, NotFoundError } from "../../errors/AppError";

export const adminFoundationService = {
  async listProfileChangeRequests(status?: "PENDING" | "APPROVED" | "REJECTED", search?: string) {
    return prisma.profileChangeRequest.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(search ? { user: { OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ] } } : {}),
      },
      include: { user: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async reviewProfileChangeRequest(id: string, adminId: string, approved: boolean, adminNote?: string) {
    const request = await prisma.profileChangeRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundError("Demande de modification de profil");
    if (request.status !== "PENDING") throw new ConflictError("Cette demande a déjà été traitée.");
    const status = approved ? "APPROVED" : "REJECTED";
    try {
      const result = await prisma.$transaction(async (tx) => {
      if (approved) {
        await tx.user.update({
          where: { id: request.userId },
          data: {
            ...(request.requestedFullName !== null ? { fullName: request.requestedFullName } : {}),
            ...(request.requestedEmail !== null ? { email: request.requestedEmail } : {}),
            ...(request.requestedPhone !== null ? { phone: request.requestedPhone } : {}),
          },
        });
      }
      const updated = await tx.profileChangeRequest.update({
        where: { id },
        data: { status, adminNote, reviewedBy: adminId, reviewedAt: new Date() },
      });
      await tx.auditLog.create({
        data: { actorUserId: adminId, action: `PROFILE_CHANGE_${status}`, entityType: "profileChangeRequest", entityId: id, metadata: { userId: request.userId } },
      });
      return updated;
      });
      return result;
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        throw new ConflictError("L'adresse e-mail ou le téléphone est déjà utilisé.");
      }
      throw error;
    }
  },

  async sendMessage(adminId: string, input: { userId?: string; allUsers?: boolean; subject: string; body: string }) {
    if (!input.userId && !input.allUsers) throw new NotFoundError("Destinataire");
    const users = input.allUsers
      ? await prisma.user.findMany({ where: { role: "CUSTOMER" }, select: { id: true } })
      : await prisma.user.findMany({ where: { id: input.userId }, select: { id: true } });
    if (!users.length) throw new NotFoundError("Utilisateur");
    const result = await prisma.$transaction(async (tx) => {
      const messages = await Promise.all(users.map((u) => tx.userMessage.create({
        data: { recipientId: u.id, senderId: adminId, subject: input.subject, body: input.body },
      })));
      await tx.auditLog.create({
        data: { actorUserId: adminId, action: "SEND_ADMIN_MESSAGE", entityType: "userMessage", metadata: { recipients: users.length, broadcast: !!input.allUsers } },
      });
      return messages;
    });
    return { delivered: result.length };
  },

  async listMessages(userId: string) {
    return prisma.userMessage.findMany({ where: { recipientId: userId }, orderBy: { createdAt: "desc" } });
  },

  async markMessageRead(userId: string, id: string) {
    await prisma.userMessage.updateMany({ where: { id, recipientId: userId }, data: { read: true } });
  },
};
