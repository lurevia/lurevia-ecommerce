import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { exportService } from "./export.service";

export const exportController = {
  exportUserBackup: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const workbook = await exportService.exportUserData(userId);

    // Filename horodaté pour éviter les collisions côté navigateur
    const filename = `lurevia_export_${userId.slice(0, 8)}_${Date.now()}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    // Empêche le navigateur de mettre en cache un export (contient des données perso)
    res.setHeader("Cache-Control", "no-store");

    await workbook.xlsx.write(res);
    res.end();
  }),
};