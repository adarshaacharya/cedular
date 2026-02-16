import type {
  FilterConfig,
  ParsedFilters,
  ParsedTableQuery,
  SearchParamValue,
  SearchParamsInput,
  SortItem,
} from "@/lib/table-query/types";

interface ParseTableSearchParamsOptions<TFilterKey extends string> {
  filterConfig: FilterConfig<TFilterKey>;
  defaultPage?: number;
  defaultPerPage?: number;
  maxPerPage?: number;
}

function firstValue(value: SearchParamValue): string | undefined {
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

function toPositiveInteger(value: SearchParamValue, fallback: number) {
  const raw = firstValue(value);
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseSort(value: SearchParamValue): SortItem[] {
  const raw = firstValue(value);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is SortItem =>
        !!item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.desc === "boolean"
    );
  } catch {
    return [];
  }
}

function parseSingleFilter(value: SearchParamValue): string | undefined {
  const raw = firstValue(value)?.trim();
  return raw ? raw : undefined;
}

function parseMultiFilter(value: SearchParamValue): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => item.split(","))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  const raw = firstValue(value);
  if (!raw) return [];

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseTableSearchParams<TFilterKey extends string>(
  input: SearchParamsInput | undefined,
  options: ParseTableSearchParamsOptions<TFilterKey>
): ParsedTableQuery<TFilterKey> {
  const {
    filterConfig,
    defaultPage = 1,
    defaultPerPage = 10,
    maxPerPage = 100,
  } = options;

  const source = input ?? {};
  const page = toPositiveInteger(source.page, defaultPage);
  const perPage = Math.min(
    maxPerPage,
    Math.max(1, toPositiveInteger(source.perPage, defaultPerPage))
  );

  const filters: ParsedFilters<TFilterKey> = {};

  for (const filterKey of Object.keys(filterConfig) as TFilterKey[]) {
    const config = filterConfig[filterKey];

    if (config.mode === "single") {
      const value = parseSingleFilter(source[filterKey]);
      if (value) {
        filters[filterKey] = value;
      }
      continue;
    }

    const values = parseMultiFilter(source[filterKey]);
    if (values.length > 0) {
      filters[filterKey] = values;
    }
  }

  return {
    page,
    perPage,
    sort: parseSort(source.sort),
    filters,
  };
}
