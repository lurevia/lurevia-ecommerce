export const sellerSearchFilter = (search?: string) =>
  search
    ? {
      seller: {
        is: {
          OR: [
            { fullName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        },
      },
    }
    : {};
