export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const MAX_PAGE_SIZE = 60;

/** Normalise page/limit pour éviter les requêtes abusives (page négative, limite énorme). */
export const normalizePagination = (page?: number, limit?: number): PaginationParams => ({
  page: Math.max(1, page ?? 1),
  limit: Math.min(MAX_PAGE_SIZE, Math.max(1, limit ?? 12)),
});

export const buildPaginatedResult = <T>(
  items: T[],
  totalItems: number,
  { page, limit }: PaginationParams
): PaginatedResult<T> => {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};
