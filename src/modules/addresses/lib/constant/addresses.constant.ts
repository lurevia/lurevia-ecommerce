export const ADDRESS_LIMITS ={
    MAX_LABEL_LENGTH: 60,
    MAX_FULL_NAME_LENGTH: 120,
    MAX_CITY_LENGTH: 100,
    MAX_NEIGHBORHOOD_LENGTH: 100,
    MAX_ADDRESS_LENGTH: 255,
    MAX_NOTES_LENGTH: 500,
} as const;

export const DEFAULT_ORDER_BY = [
    { isDefault: "desc"},
    { createdAt: "desc"}
] as const;