import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { BadRequestError } from "../../../errors/AppError";

export const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

export const dataUrlPattern =
  /^data:(image\/(?:jpeg|png|gif|webp));base64,([A-Za-z0-9+/]+={0,2})$/;

export const MAX_MEDIA_PER_USER = 500;

export const isPrivateAddress = (address: string): boolean => {
  const value = address.toLowerCase().replace(/^\[|\]$/g, "");
  if (isIP(value) === 4) {
    const [a, b] = value.split(".").map(Number);
    return (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }
  return (
    value === "::1" ||
    value === "::" ||
    /^(fc|fd|fe[89ab])/.test(value) ||
    /^::ffff:(10|127|192\.168|172\.(1[6-9]|2\d|3[01]))\./.test(value)
  );
};

export const assertPublicUrl = async (value: string): Promise<URL> => {
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new BadRequestError(
      "Seules les URLs HTTP(S) publiques sont acceptées"
    );
  }

  let addresses: { address: string; }[];
  try {
    addresses = isIP(url.hostname)
      ? [{ address: url.hostname }]
      : await lookup(url.hostname, { all: true, verbatim: true });
  } catch {
    throw new BadRequestError("Le nom d'hôte de cette URL est introuvable");
  }

  if (
    !addresses.length ||
    addresses.some(({ address }) => isPrivateAddress(address))
  ) {
    throw new BadRequestError(
      "La cible de cette URL n'est pas une adresse publique"
    );
  }
  return url;
};

export const assertImageSignature = (
  bytes: Buffer,
  contentType: string
): void => {
  const valid =
    (contentType === "image/jpeg" &&
      bytes.length > 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff) ||
    (contentType === "image/png" &&
      bytes
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
    (contentType === "image/gif" &&
      /^GIF8[79]a$/.test(bytes.subarray(0, 6).toString("ascii"))) ||
    (contentType === "image/webp" &&
      bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
      bytes.subarray(8, 12).toString("ascii") === "WEBP");

  if (!valid) {
    throw new BadRequestError(
      "Le contenu téléchargé n'est pas une image valide"
    );
  }
};
