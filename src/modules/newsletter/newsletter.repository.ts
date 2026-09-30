import { prisma } from "../../lib/prisma";

export const newsletterRepository = {
  findByEmail: (email: string) =>
    prisma.newsletterSubscriber.findUnique({ where: { email } }),

  findByConfirmationToken: (token: string) =>
    prisma.newsletterSubscriber.findUnique({
      where: { confirmationToken: token },
    }),

  create: (data: {
    email: string;
    confirmationToken: string;
    createdByIp?: string;
  }) =>
    prisma.newsletterSubscriber.create({ data }),

  confirm: (id: string) =>
    prisma.newsletterSubscriber.update({
      where: { id },
      data: {
        confirmedAt: new Date(),
        confirmationToken: null, // Token à usage unique
      },
    }),

  resubscribe: (id: string, confirmationToken: string) =>
    prisma.newsletterSubscriber.update({
      where: { id },
      data: {
        unsubscribedAt: null,
        unsubscribeReason: null,
        confirmationToken,
      },
    }),

  unsubscribe: (email: string, reason?: string) =>
    prisma.newsletterSubscriber.update({
      where: { email },
      data: {
        unsubscribedAt: new Date(),
        unsubscribeReason: reason ?? null,
      },
    }),

  countConfirmed: () =>
    prisma.newsletterSubscriber.count({
      where: {
        confirmedAt: { not: null },
        unsubscribedAt: null,
      },
    }),

  // Pour l'admin : liste paginée
  findMany: (skip: number, take: number) =>
    prisma.$transaction([
      prisma.newsletterSubscriber.findMany({
        orderBy: { subscribedAt: "desc" },
        skip,
        take,
      }),
      prisma.newsletterSubscriber.count(),
    ]),
};