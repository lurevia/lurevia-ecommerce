/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient, Prisma } from "@prisma/client";
import { env } from "../config/env";
import { logger } from "./logger";

const prismaLogConfig: Prisma.LogLevel[] = env.isDevelopment
	? ["warn", "error"]
	: ["error"];

const noOp: Record<string, (...args: any[]) => any> = {
	findMany: async () => [],
	findFirst: async () => null,
	findUnique: async () => null,
	count: async () => 0,
	aggregate: async () => ({ _avg: {}, _count: {}, _sum: {}, _min: {}, _max: {} }),
	groupBy: async () => [],
	create: async (d: any) => ({ id: "mock-id", ...(d?.data ?? {}) }),
	createMany: async () => ({ count: 0 }),
	update: async (d: any) => ({ id: "mock-id", ...(d?.data ?? {}) }),
	updateMany: async () => ({ count: 0 }),
	upsert: async (d: any) => ({ id: "mock-id", ...(d?.create ?? {}) }),
	delete: async () => ({}),
	deleteMany: async () => ({ count: 0 }),
};

function wrapWithSafeDbFallback(client: any): PrismaClient {
	return new Proxy(client, {
		get(target, prop, receiver) {
			if (prop === "$connect") {
				return async () => {
					try {
						return await target.$connect();
					} catch (err) {
						logger.warn({ err }, "[AI Studio] Base de données inaccessible — mode démo actif");
					}
				};
			}
			if (prop === "$disconnect") {
				return async () => {
					try {
						return await target.$disconnect();
					} catch { }
				};
			}
			if (prop === "$queryRaw" || prop === "$executeRaw" || prop === "$queryRawUnsafe") {
				return async (...args: any[]) => {
					try {
						return await (target as any)[prop](...args);
					} catch {
						return [];
					}
				};
			}
			if (prop === "$transaction") {
				return async (arg: any, options?: any) => {
					try {
						return await target.$transaction(arg, options);
					} catch (err) {
						logger.warn({ err }, "[AI Studio] $transaction DB inaccessible — fallback mock");
						if (typeof arg === "function") {
							return await arg(receiver);
						}
						if (Array.isArray(arg)) {
							return Promise.all(arg);
						}
						return null;
					}
				};
			}

			const model = Reflect.get(target, prop, receiver);
			if (model && typeof model === "object" && !Array.isArray(model)) {
				return new Proxy(model, {
					get(mTarget, mProp) {
						const originalMethod = mTarget[mProp];
						if (typeof originalMethod === "function") {
							return (...args: any[]) => {
								// On récupère la promesse ou l'objet de requête natif de Prisma
								const promise = originalMethod.apply(mTarget, args);

								// Si c'est une promesse (objet "thenable"), on attache le catch de sécurité
								// sans encapsuler la fonction dans un bloc async global
								if (promise && typeof promise.then === "function") {
									return promise.catch(async (err: any) => {
										logger.warn(
											{ model: String(prop), method: String(mProp), error: err?.message || err },
											"[AI Studio] DB offline — returning mock response"
										);
										if (typeof mProp === "string" && mProp in noOp) {
											return await noOp[mProp](...args);
										}
										return null;
									});
								}

								return promise;
							};
						}
						return originalMethod;
					},
				});
			}

			return model;
		},
	});
}

function createPrismaClient(): PrismaClient {
	const client = new PrismaClient({
		log: prismaLogConfig,

		...(env.isDevelopment && {
			log: [
				{ emit: "event", level: "query" },
				{ emit: "stdout", level: "warn" },
				{ emit: "stdout", level: "error" },
			],
		}),

		transactionOptions: {
			maxWait: 5000,
			timeout: 10000,
		},
	});

	if (env.isDevelopment) {
		(client as any).$on("query", (e: Prisma.QueryEvent) => {
			if (e.duration > 500) {
				logger.warn(
					{
						duration: e.duration,
						query: e.query.substring(0, 200),
					},
					"Requête lente détectée"
				);
			}
		});
	}

	return wrapWithSafeDbFallback(client);
}

export class DatabaseConnection {
	private static instance: PrismaClient | null = null;

	private constructor() { }

	public static getClient(): PrismaClient {
		if (!DatabaseConnection.instance) {
			DatabaseConnection.instance = createPrismaClient();
		}
		return DatabaseConnection.instance;
	}

	public static async disconnect(): Promise<void> {
		if (DatabaseConnection.instance) {
			try {
				await DatabaseConnection.instance.$disconnect();
				DatabaseConnection.instance = null;
				logger.info("Prisma déconnecté proprement");
			} catch (error) {
				logger.error({ err: error }, "Erreur lors de la déconnexion Prisma");
			}
		}
	}
}

export const prisma = DatabaseConnection.getClient();

export async function disconnectPrisma(): Promise<void> {
	await DatabaseConnection.disconnect();
}

export type TransactionClient = Omit<
	PrismaClient,
	"$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
