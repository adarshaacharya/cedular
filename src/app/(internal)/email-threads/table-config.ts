import prisma from "@/lib/prisma";
import { createServerTableQuery } from "@/lib/table-query/create-table-query";
import { containsInsensitive, normalizeEnumFilter } from "@/lib/table-query/prisma-builders";
import type { SearchParamsInput } from "@/lib/table-query/types";
import type { Prisma } from "@/prisma/generated/prisma/client";
import { EmailThreadStatus } from "@/prisma/generated/prisma/enums";

export type EmailThreadsTableRow = Prisma.EmailThreadGetPayload<Record<string, never>>;

const allowedStatuses = [
  EmailThreadStatus.pending,
  EmailThreadStatus.processing,
  EmailThreadStatus.scheduled,
  EmailThreadStatus.awaiting_confirmation,
  EmailThreadStatus.confirmed,
  EmailThreadStatus.failed,
] as const;

const queryEmailThreads = createServerTableQuery<
  "subject" | "status",
  { userId: string },
  Prisma.EmailThreadWhereInput,
  Prisma.EmailThreadOrderByWithRelationInput,
  EmailThreadsTableRow
>({
  filterConfig: {
    subject: { mode: "single" },
    status: { mode: "multi" },
  },
  defaultPerPage: 10,
  maxPerPage: 100,
  fallbackOrderBy: [{ createdAt: "desc" }],
  orderByMap: {
    subject: (direction) => ({ subject: direction }),
    status: (direction) => ({ status: direction }),
    intent: (direction) => ({ intent: direction }),
    createdAt: (direction) => ({ createdAt: direction }),
  },
  buildWhere: ({ query, context }) => {
    const subject = query.filters.subject;
    const statuses = normalizeEnumFilter({
      value: query.filters.status,
      allowed: allowedStatuses,
    });

    return {
      userId: context.userId,
      ...(typeof subject === "string"
        ? {
            subject: containsInsensitive(subject),
          }
        : {}),
      ...(statuses.length > 0 ? { status: { in: statuses } } : {}),
    };
  },
  count: ({ where }) => prisma.emailThread.count({ where }),
  findMany: ({ where, orderBy, skip, take }) =>
    prisma.emailThread.findMany({
      where,
      orderBy,
      skip,
      take,
    }),
});

export async function queryEmailThreadsTable(args: {
  userId: string;
  input?: SearchParamsInput;
}) {
  return queryEmailThreads({
    context: { userId: args.userId },
    input: args.input,
  });
}
