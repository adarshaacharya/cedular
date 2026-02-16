import prisma from "@/lib/prisma";
import { createServerTableQuery } from "@/lib/table-query/create-table-query";
import { containsInsensitive, normalizeEnumFilter } from "@/lib/table-query/prisma-builders";
import type { SearchParamsInput } from "@/lib/table-query/types";
import type { Prisma } from "@/prisma/generated/prisma/client";
import type { MeetingStatus } from "@/prisma/generated/prisma/enums";

const meetingInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  },
  emailThread: {
    select: {
      id: true,
      subject: true,
      threadId: true,
      status: true,
      intent: true,
      participants: true,
      createdAt: true,
    },
  },
} satisfies Prisma.MeetingInclude;

export type MeetingsTableRow = Prisma.MeetingGetPayload<{
  include: typeof meetingInclude;
}>;

const allowedStatuses = ["proposed", "confirmed", "cancelled"] as const satisfies readonly MeetingStatus[];

const queryMeetings = createServerTableQuery<
  "title" | "status",
  { userId: string },
  Prisma.MeetingWhereInput,
  Prisma.MeetingOrderByWithRelationInput,
  MeetingsTableRow
>({
  filterConfig: {
    title: { mode: "single" },
    status: { mode: "multi" },
  },
  defaultPerPage: 10,
  maxPerPage: 100,
  fallbackOrderBy: [{ startTime: "asc" }, { createdAt: "desc" }],
  orderByMap: {
    title: (direction) => ({ title: direction }),
    status: (direction) => ({ status: direction }),
    source: (direction) => ({ source: direction }),
    date: (direction) => ({ startTime: direction }),
    time: (direction) => ({ startTime: direction }),
    startTime: (direction) => ({ startTime: direction }),
  },
  buildWhere: ({ query, context }) => {
    const title = query.filters.title;
    const statuses = normalizeEnumFilter({
      value: query.filters.status,
      allowed: allowedStatuses,
    });

    return {
      userId: context.userId,
      ...(typeof title === "string" ? { title: containsInsensitive(title) } : {}),
      ...(statuses.length > 0 ? { status: { in: statuses } } : {}),
    };
  },
  count: ({ where }) => prisma.meeting.count({ where }),
  findMany: ({ where, orderBy, skip, take }) =>
    prisma.meeting.findMany({
      where,
      orderBy,
      skip,
      take,
      include: meetingInclude,
    }),
});

export async function queryMeetingsTable(args: {
  userId: string;
  input?: SearchParamsInput;
}) {
  return queryMeetings({
    context: { userId: args.userId },
    input: args.input,
  });
}
