import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle, Mail, Settings } from "lucide-react";

export function QuickActions() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="flex flex-col gap-2">
        <Button asChild variant="default" className="w-full justify-start">
          <Link href="/email-threads">
            <Mail className="mr-2 h-4 w-4" />
            View All Requests
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/meetings">
            <PlusCircle className="mr-2 h-4 w-4" />
            View Meetings
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>
    </Card>
  );
}
