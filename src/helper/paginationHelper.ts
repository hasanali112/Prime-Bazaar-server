type SortOrder =
  | "ASC"
  | "DESC"
  | "LOW_TO_HIGH"
  | "HIGH_TO_LOW"
  | "NEWEST"
  | "OLDEST";

interface IOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

type IOptionsResult = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: SortOrder;
};

export const calculatePagination = (options: IOptions): IOptionsResult => {
  const page: number = Number(options.page) || 1;
  const limit: number = Number(options.limit) || 10;
  const skip: number = (page - 1) * limit;
  const sortBy: string = options.sortBy || "createdAt";
  const sortOrder: SortOrder = options.sortOrder || "DESC";
  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};
