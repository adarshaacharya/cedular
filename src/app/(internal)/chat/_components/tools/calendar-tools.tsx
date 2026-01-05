import { formatDate } from "@/lib/date";
import Image from "next/image";

export interface CreateCalendarEventToolInput {
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  timeZone: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  location?: string;
  addConference: boolean;
}

export interface UpdateCalendarEventToolInput {
  eventId: string;
  summary?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  timeZone?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  location?: string;
}

export interface DeleteCalendarEventToolInput {
  eventId: string;
}

export const CreateCalendarEventConfirmation = ({
  input,
}: {
  input: CreateCalendarEventToolInput;
}) => (
  <div className="space-y-3">
    <div className="font-medium">{input.summary}</div>
    {input.description && (
      <div className="text-sm text-muted-foreground">{input.description}</div>
    )}
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <div className="font-medium">Starts</div>
        <div>
          {formatDate(input.startDateTime, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      </div>
      <div>
        <div className="font-medium">Ends</div>
        <div>
          {formatDate(input.endDateTime, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
    {input.location && (
      <div className="text-sm">
        <span className="font-medium">Location:</span> {input.location}
      </div>
    )}
    {input.attendees && input.attendees.length > 0 && (
      <div className="text-sm">
        <span className="font-medium">Attendees:</span>{" "}
        {input.attendees
          .map(
            (a: { displayName?: string; email?: string }) =>
              a.displayName || a.email
          )
          .join(", ")}
      </div>
    )}
    {input.addConference && (
      <div className="text-sm text-green-600 flex items-center gap-2">
        <Image
          src="/icons/google-calendar.svg"
          alt="Google Calendar"
          width={16}
          height={16}
          className="size-4"
        />
        Google Calendar video conference will be added
      </div>
    )}
  </div>
);

export const UpdateCalendarEventConfirmation = ({
  input,
}: {
  input: UpdateCalendarEventToolInput;
}) => (
  <div className="space-y-2">
    <div className="text-sm">
      <span className="font-medium">Event ID:</span> {input.eventId}
    </div>
    {input.summary && (
      <div className="text-sm">
        <span className="font-medium">New Title:</span> {input.summary}
      </div>
    )}
    {input.startDateTime && (
      <div className="text-sm">
        <span className="font-medium">New Start:</span>{" "}
        {formatDate(input.startDateTime, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </div>
    )}
    {/* Add other fields as needed */}
  </div>
);

export const DeleteCalendarEventConfirmation = ({
  input,
}: {
  input: DeleteCalendarEventToolInput;
}) => (
  <div className="text-sm">
    <span className="font-medium">Delete event:</span> {input.eventId}
  </div>
);
