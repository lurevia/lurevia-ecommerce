/**
 * Module notifications — API publique.
 *
 * Expose uniquement le router, le(s) service(s) utilisables par les autres modules
 * et les types de sortie. Le reste (repository, controller, mapper, constantes) est interne.
 */

export { default as notificationsRouter } from "./routes/notifications.routes";

export { notificationTriggersService } from "./services/notifications-triggers.service";
export type { NotificationTriggersService } from "./services/notifications-triggers.service";
export { notificationsService } from "./services/notifications.service";
export type { NotificationsService } from "./services/notifications.service";
