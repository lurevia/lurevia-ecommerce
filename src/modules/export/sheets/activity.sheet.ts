import type { Workbook } from "exceljs";
import { boldHeader, toDateStr } from "../export.helpers";

export interface BidExportRecord {
  createdAt: Date | string;
  product: { title: string; sku: string };
  proposedPrice: number;
  status: string;
  isWinningBid?: boolean;
  comment?: string | null;
}

export interface ReviewExportRecord {
  createdAt: Date | string;
  rating: number;
  title?: string | null;
  comment: string;
  isApproved?: boolean;
  isVerifiedPurchase?: boolean;
}

export interface FavoriteExportRecord {
  createdAt: Date | string;
  product: { title: string; sku: string };
}

export interface FeedbackExportRecord {
  createdAt: Date | string;
  category: string;
  overallRating: number;
  comment: string;
  response?: string | null;
  teamResponse?: string | null;
}

export function buildBidsSheet(workbook: Workbook, bids: BidExportRecord[]) {
  const bidSheet = workbook.addWorksheet("Offres");
  bidSheet.columns = [
    { header: "Date", key: "date", width: 20 },
    { header: "Produit", key: "product", width: 35 },
    { header: "SKU", key: "sku", width: 20 },
    { header: "Prix proposé", key: "proposedPrice", width: 15 },
    { header: "Statut", key: "status", width: 15 },
    { header: "Gagnante", key: "isWinning", width: 12 },
    { header: "Commentaire", key: "comment", width: 40 },
  ];

  bids.forEach((b) =>
    bidSheet.addRow({
      date: toDateStr(b.createdAt),
      product: b.product.title,
      sku: b.product.sku,
      proposedPrice: b.proposedPrice,
      status: b.status,
      isWinning: b.isWinningBid ? "Oui" : "Non",
      comment: b.comment ?? "",
    })
  );
  boldHeader(bidSheet);
}

export function buildReviewsSheet(workbook: Workbook, reviews: ReviewExportRecord[]) {
  const reviewSheet = workbook.addWorksheet("Avis");
  reviewSheet.columns = [
    { header: "Date", key: "date", width: 20 },
    { header: "Note", key: "rating", width: 8 },
    { header: "Titre", key: "title", width: 30 },
    { header: "Commentaire", key: "comment", width: 60 },
    { header: "Approuvé", key: "approved", width: 12 },
    { header: "Achat vérifié", key: "verified", width: 15 },
  ];

  reviews.forEach((r) =>
    reviewSheet.addRow({
      date: toDateStr(r.createdAt),
      rating: r.rating,
      title: r.title ?? "",
      comment: r.comment,
      approved: r.isApproved ? "Oui" : "Non",
      verified: r.isVerifiedPurchase ? "Oui" : "Non",
    })
  );
  boldHeader(reviewSheet);
}

export function buildFavoritesSheet(workbook: Workbook, favorites: FavoriteExportRecord[]) {
  const favSheet = workbook.addWorksheet("Favoris");
  favSheet.columns = [
    { header: "Ajouté le", key: "date", width: 20 },
    { header: "Produit", key: "product", width: 40 },
    { header: "SKU", key: "sku", width: 20 },
  ];
  favorites.forEach((f) =>
    favSheet.addRow({
      date: toDateStr(f.createdAt),
      product: f.product.title,
      sku: f.product.sku,
    })
  );
  boldHeader(favSheet);
}

export function buildFeedbackSheet(workbook: Workbook, feedbacks: FeedbackExportRecord[]) {
  const feedbackSheet = workbook.addWorksheet("Feedback");
  feedbackSheet.columns = [
    { header: "Date", key: "date", width: 20 },
    { header: "Catégorie", key: "category", width: 15 },
    { header: "Note", key: "rating", width: 8 },
    { header: "Commentaire", key: "comment", width: 60 },
    { header: "Réponse équipe", key: "response", width: 60 },
  ];
  feedbacks.forEach((f) =>
    feedbackSheet.addRow({
      date: toDateStr(f.createdAt),
      category: f.category,
      rating: f.overallRating,
      comment: f.comment,
      response: f.teamResponse ?? "",
    })
  );
  boldHeader(feedbackSheet);
}
