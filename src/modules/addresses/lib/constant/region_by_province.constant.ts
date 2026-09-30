import type {
    ProvinceMadagascar, RegionMadagascar
} from "@prisma/client"

export const REGIONS_BY_PROVINCE = {
    ANTANANARIVO: [
        "ITASY", "ANALAMANGA", 
        "VAKINANKARATRA", "BONGOLAVA"
    ],
    ANTSIRANANA: ["DIANA", "SAVA"],
    MAHAJANGA: [
        "SOFIA", "BOENY",
        "BETSIBOKA", "MELAKY"
    ],
    TOAMASINA: [
        "ALAOTRA_MANGORO", "ATSINANANA",
        "ANALANJIROFO", "AMBATOSOA"
    ],
    FIANARANTSOA: [
        "AMORON_I_MANIA", "HAUTE_MATSIATRA",
        "VATOVAVY", "FITOVINANY",
        "ATSIMO_ATSINANANA", "IHOROMBE",
    ],
    TOLIARA: [
        "MENABE", "ATSIMO_ANDREFANA",
        "ANDROY", "ANOSY"
    ],
} satisfies Record<ProvinceMadagascar, readonly RegionMadagascar[]>;