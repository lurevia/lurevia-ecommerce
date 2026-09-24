import { Request, Response } from "express";
import { exportService } from "./export.service";

export const exportController = {
  async exportUserBackup(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Utilisateur non authentifié" });
      return;
    }

    try {
      const workbook = await exportService.exportUserData(userId);

      // Set headers for Excel download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=lurevia_backup_${userId}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors de l'exportation des données", error: error.message });
    }
  },
};
