import { prisma } from "../../../lib/prisma";

export class NewsletterRepository {
    findByEmail(email: string) {
        return prisma.newsletterSubscriber.findUnique({ where: { email } });
    }

    findByConfirmationToken(token: string) {
        return prisma.newsletterSubscriber.findUnique({
            where: { confirmationToken: token },
        });
    }

    create(data: {
        email: string;
        confirmationToken: string;
        createdByIp?: string;
    }) {
        return prisma.newsletterSubscriber.create({ data });
    }

    confirm(id: string) {
        return prisma.newsletterSubscriber.update({
            where: { id },
            data: {
                confirmedAt: new Date(),
                confirmationToken: null, // Token à usage unique
            },
        });
    }

    resubscribe(id: string, confirmationToken: string) {
        return prisma.newsletterSubscriber.update({
            where: { id },
            data: {
                unsubscribedAt: null,
                unsubscribeReason: null,
                confirmationToken,
            },
        });
    }

    unsubscribe(email: string, reason?: string) {
        return prisma.newsletterSubscriber.update({
            where: { email },
            data: {
                unsubscribedAt: new Date(),
                unsubscribeReason: reason ?? null,
            },
        });
    }

    countConfirmed() {
        return prisma.newsletterSubscriber.count({
            where: {
                confirmedAt: { not: null },
                unsubscribedAt: null,
            },
        });
    }

    // Pour l'admin : liste paginée
    findMany(skip: number, take: number) {
        return prisma.$transaction([
            prisma.newsletterSubscriber.findMany({
                orderBy: { subscribedAt: "desc" },
                skip,
                take,
            }),
            prisma.newsletterSubscriber.count(),
        ]);
    }
}

export const newsletterRepository = new NewsletterRepository();
