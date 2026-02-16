import type { SortItem, TablePageResult } from "@/lib/table-query/types";

export type SortDirection = "asc" | "desc";

export function buildOffsetPagination(query: { page: number; perPage: number }) {
  return {
    skip: (query.page - 1) * query.perPage,
    take: query.perPage,
  };
}

export function buildPageResult<TData>(args: {
  data: TData[];
  total: number;
  perPage: number;
}): TablePageResult<TData> {
  const { data, total, perPage } = args;

  return {
    data,
    total,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
}

export function buildOrderBy<TOrderBy>(args: {
  sort: SortItem[];
  map: Record<string, (direction: SortDirection) => TOrderBy | TOrderBy[] | null>;
  fallback: TOrderBy[];
}): TOrderBy[] {
  const { sort, map, fallback } = args;
  const orderBy: TOrderBy[] = [];

  for (const item of sort) {
    const mapper = map[item.id];
    if (!mapper) continue;

    const direction: SortDirection = item.desc ? "desc" : "asc";
    const mapped = mapper(direction);

    if (!mapped) continue;

    if (Array.isArray(mapped)) {
      orderBy.push(...mapped);
    } else {
      orderBy.push(mapped);
    }
  }

  return orderBy.length > 0 ? orderBy : fallback;
}

export function containsInsensitive(value: string) {
  return {
    contains: value,
    mode: "insensitive" as const,
  };
}

export function normalizeEnumFilter<T extends string>(args: {
  value: string | string[] | undefined;
  allowed: readonly T[];
}): T[] {
  const { value, allowed } = args;
  const values = Array.isArray(value) ? value : value ? [value] : [];
  const allowedSet = new Set(allowed);

  return values.filter((item): item is T => allowedSet.has(item as T));
}
