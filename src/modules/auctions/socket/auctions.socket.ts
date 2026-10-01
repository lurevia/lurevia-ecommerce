import { Server as HTTPServer } from "node:http";
import { Server as SocketServer, type Socket } from "socket.io";
import { env } from "../../../config/env";
import { logger } from "../../../lib/logger";

/**
 * Setup Socket.IO pour les enchères live.
 *
 * Rooms :
 *   - `auction:{productId}` : tous les clients sur cette enchère
 *
 * Events émis :
 *   - bid:new        → nouvelle offre (broadcast)
 *   - message:new    → nouveau message chat (broadcast)
 *   - watcher:count  → nombre de spectateurs (broadcast)
 *   - auction:ended  → fin de l'enchère (broadcast)
 *
 * Events reçus :
 *   - join:auction   → rejoindre une room
 *   - leave:auction  → quitter une room
 */
export function setupAuctionSocket(httpServer: HTTPServer) {
    const io = new SocketServer(httpServer, {
        cors: {
            origin: env.corsOrigins,
            credentials: true,
        },
        path: "/socket.io",
    });

    io.on("connection", (socket: Socket) => {
        logger.debug({ socketId: socket.id }, "WebSocket connected");

        socket.on("join:auction", (productId: string) => {
            if (typeof productId !== "string") return;
            const room = `auction:${productId}`;
            socket.join(room);
            logger.debug({ socketId: socket.id, productId }, "Join auction room");
        });

        socket.on("leave:auction", (productId: string) => {
            const room = `auction:${productId}`;
            socket.leave(room);
        });

        socket.on("disconnect", () => {
            logger.debug({ socketId: socket.id }, "WebSocket disconnected");
        });
    });

    return io;
}

/**
 * Helper pour broadcaster depuis un service HTTP.
 * Le service appelle `broadcastNewMessage(io, productId, message)` après un POST.
 */
export function broadcastNewMessage(
    io: SocketServer,
    productId: string,
    message: unknown
) {
    io.to(`auction:${productId}`).emit("message:new", message);
}

export function broadcastNewBid(
    io: SocketServer,
    productId: string,
    bid: unknown
) {
    io.to(`auction:${productId}`).emit("bid:new", bid);
}

export function broadcastWatcherCount(
    io: SocketServer,
    productId: string,
    count: number
) {
    io.to(`auction:${productId}`).emit("watcher:count", count);
}

export function broadcastAuctionEnded(
    io: SocketServer,
    productId: string,
    result: unknown
) {
    io.to(`auction:${productId}`).emit("auction:ended", result);
}
