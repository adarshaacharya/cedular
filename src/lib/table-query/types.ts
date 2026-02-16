export type SearchParamValue = string | number | string[] | undefined;

export type SearchParamsInput = Record<string, SearchParamValue>;

export type SortItem = {
  id: string;
  desc: boolean;
};

export type FilterMode = "single" | "multi";

export type FilterConfig<TFilterKey extends string> = Record<
  TFilterKey,
  {
    mode: FilterMode;
  }
>;

export type ParsedFilters<TFilterKey extends string> = Partial<
  Record<TFilterKey, string | string[]>
>;

export type ParsedTableQuery<TFilterKey extends string> = {
  page: number;
  perPage: number;
  sort: SortItem[];
  filters: ParsedFilters<TFilterKey>;
};

export type TablePageResult<TData> = {
  data: TData[];
  total: number;
  pageCount: number;
};
