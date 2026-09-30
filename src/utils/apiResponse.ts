import type { Response } from "express";

/**
 * Format standardisé des réponses API.
 * Succès : { data: T }
 * Erreur  : { error: { code, message, details? } }
 */

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({ data });
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201);
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}

export function sendPaginated<T>(
  res: Response,
  items: T[],
  pagination: Record<string, unknown>
): void {
  res.status(200).json({ data: items, pagination });
}