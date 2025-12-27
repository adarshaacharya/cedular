import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Mail, Settings } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks at your fingertips</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button asChild variant="outline" className="w-full justify-start hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-colors">
          <Link href="/meetings/new">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Meeting
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start hover:bg-purple-500/10 hover:text-purple-600 hover:border-purple-500/30 transition-colors">
          <Link href="/calendar">
            <Calendar className="mr-2 h-4 w-4" />
            View Calendar
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start hover:bg-green-500/10 hover:text-green-600 hover:border-green-500/30 transition-colors">
          <Link href="/email-threads">
            <Mail className="mr-2 h-4 w-4" />
            Check Emails
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start hover:bg-orange-500/10 hover:text-orange-600 hover:border-orange-500/30 transition-colors">
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

