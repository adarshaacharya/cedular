import { buildOffsetPagination, buildOrderBy, buildPageResult } from "@/lib/table-query/prisma-builders";
import { parseTableSearchParams } from "@/lib/table-query/parse";
import type {
  FilterConfig,
  ParsedTableQuery,
  SearchParamsInput,
  TablePageResult,
} from "@/lib/table-query/types";

interface CreateServerTableQueryOptions<
  TFilterKey extends string,
  TContext,
  TWhere,
  TOrderBy,
  TData,
> {
  filterConfig: FilterConfig<TFilterKey>;
  defaultPage?: number;
  defaultPerPage?: number;
  maxPerPage?: number;
  orderByMap: Record<
    string,
    (direction: "asc" | "desc") => TOrderBy | TOrderBy[] | null
  >;
  fallbackOrderBy: TOrderBy[];
  buildWhere: (args: {
    query: ParsedTableQuery<TFilterKey>;
    context: TContext;
  }) => TWhere;
  count: (args: { where: TWhere; context: TContext }) => Promise<number>;
  findMany: (args: {
    where: TWhere;
    orderBy: TOrderBy[];
    skip: number;
    take: number;
    context: TContext;
  }) => Promise<TData[]>;
}

export function createServerTableQuery<
  TFilterKey extends string,
  TContext,
  TWhere,
  TOrderBy,
  TData,
>(options: CreateServerTableQueryOptions<TFilterKey, TContext, TWhere, TOrderBy, TData>) {
  return async (args: {
    input?: SearchParamsInput;
    context: TContext;
  }): Promise<TablePageResult<TData>> => {
    const query = parseTableSearchParams(args.input, {
      filterConfig: options.filterConfig,
      defaultPage: options.defaultPage,
      defaultPerPage: options.defaultPerPage,
      maxPerPage: options.maxPerPage,
    });

    const where = options.buildWhere({
      query,
      context: args.context,
    });

    const orderBy = buildOrderBy({
      sort: query.sort,
      map: options.orderByMap,
      fallback: options.fallbackOrderBy,
    });

    const { skip, take } = buildOffsetPagination({
      page: query.page,
      perPage: query.perPage,
    });

    const [total, data] = await Promise.all([
      options.count({ where, context: args.context }),
      options.findMany({
        where,
        orderBy,
        skip,
        take,
        context: args.context,
      }),
    ]);

    return buildPageResult({
      data,
      total,
      perPage: query.perPage,
    });
  };
}
