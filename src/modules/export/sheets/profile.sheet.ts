import type { Workbook } from "exceljs";
import { boldHeader, toDateStr } from "../export.helpers";

export interface UserExportData {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  age?: number | null;
  role: string;
  isVerified?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  isMinor?: boolean;
  primaryProvider?: string;
  createdAt: Date | string;
  lastLoginAt?: Date | string | null;
  cinNumber?: string | null;
  cinVerifiedAt?: Date | string | null;
  guardianFullName?: string | null;
  guardianCinNumber?: string | null;
  guardianRelation?: string | null;
  guardianPhone?: string | null;
  guardianCinVerifiedAt?: Date | string | null;
}

export interface AddressExportData {
  label: string;
  fullName: string;
  phone: string;
  province: string;
  region: string;
  city: string;
  neighborhood?: string | null;
  address: string;
  pickupPoint?: { provider: string; name: string } | null;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
}

export function buildProfileSheet(workbook: Workbook, user: UserExportData) {
  const profile = workbook.addWorksheet("Profil");
  profile.columns = [
    { header: "Champ", key: "field", width: 30 },
    { header: "Valeur", key: "value", width: 50 },
  ];

  const profileRows: Array<[string, string | number | boolean | null | undefined]> = [
    ["ID", user.id],
    ["Nom complet", user.fullName],
    ["Email", user.email],
    ["Téléphone", user.phone ?? ""],
    ["Genre", user.gender ?? ""],
    ["Âge", user.age ?? ""],
    ["Rôle", user.role],
    ["Compte vérifié", user.isVerified ? "Oui" : "Non"],
    ["Email vérifié", user.emailVerified ? "Oui" : "Non"],
    ["Téléphone vérifié", user.phoneVerified ? "Oui" : "Non"],
    ["Mineur", user.isMinor ? "Oui" : "Non"],
    ["Méthode d'inscription", user.primaryProvider ?? ""],
    ["Créé le", toDateStr(user.createdAt)],
    ["Dernière connexion", toDateStr(user.lastLoginAt)],
  ];

  if (user.cinNumber) {
    profileRows.push(["CIN", user.cinNumber]);
    profileRows.push(["CIN vérifié le", toDateStr(user.cinVerifiedAt)]);
  }

  if (user.guardianCinNumber) {
    profileRows.push(["Nom du tuteur", user.guardianFullName ?? ""]);
    profileRows.push(["CIN du tuteur", user.guardianCinNumber]);
    profileRows.push(["Lien", user.guardianRelation ?? ""]);
    profileRows.push(["Téléphone du tuteur", user.guardianPhone ?? ""]);
    profileRows.push([
      "CIN tuteur vérifié le",
      toDateStr(user.guardianCinVerifiedAt),
    ]);
  }

  profileRows.forEach(([field, value]) =>
    profile.addRow({ field, value: value ?? "" })
  );
  boldHeader(profile);
}

export function buildAddressesSheet(workbook: Workbook, addresses: AddressExportData[]) {
  const addressSheet = workbook.addWorksheet("Adresses");
  addressSheet.columns = [
    { header: "Label", key: "label", width: 15 },
    { header: "Nom complet", key: "fullName", width: 25 },
    { header: "Téléphone", key: "phone", width: 18 },
    { header: "Province", key: "province", width: 18 },
    { header: "Région", key: "region", width: 22 },
    { header: "Ville", key: "city", width: 18 },
    { header: "Quartier", key: "neighborhood", width: 18 },
    { header: "Adresse", key: "address", width: 35 },
    { header: "Point relais", key: "pickupPoint", width: 25 },
    { header: "Latitude", key: "latitude", width: 12 },
    { header: "Longitude", key: "longitude", width: 12 },
    { header: "Par défaut", key: "isDefault", width: 12 },
  ];

  addresses.forEach((a) =>
    addressSheet.addRow({
      label: a.label,
      fullName: a.fullName,
      phone: a.phone,
      province: a.province,
      region: a.region,
      city: a.city,
      neighborhood: a.neighborhood ?? "",
      address: a.address,
      pickupPoint: a.pickupPoint
        ? `${a.pickupPoint.provider} — ${a.pickupPoint.name}`
        : "",
      latitude: a.latitude ?? "",
      longitude: a.longitude ?? "",
      isDefault: a.isDefault ? "Oui" : "Non",
    })
  );
  boldHeader(addressSheet);
}
