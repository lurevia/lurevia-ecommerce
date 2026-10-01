import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { exportService, type ExportService } from "../services/export.service";

export class ExportController {
    constructor(
        private readonly service: ExportService
    ) { }

    exportUserBackup = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;

        const workbook = await this.service.exportUserData(userId);

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
    });
}

export const exportController = new ExportController(exportService);
