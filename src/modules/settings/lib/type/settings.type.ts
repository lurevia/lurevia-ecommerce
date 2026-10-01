import type { PlatformSettings } from "@prisma/client";
import { PUBLIC_FIELDS } from "../constant/settings.constant";

export type PublicFieldKey = (typeof PUBLIC_FIELDS)[number];

export type PublicSettings = Pick<PlatformSettings, PublicFieldKey>;
