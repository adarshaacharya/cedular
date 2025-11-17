import { ThreadsTable } from "./_components/threads-table";
import { getEmailThreads } from "./actions";

export default async function EmailThreadsPage() {
  const threads = await getEmailThreads();

  return <ThreadsTable threads={threads} />;
}
