import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DocumentEntry } from "@/types/registry";
import type { User } from "@/types/registry";

interface OperatorActivityProps {
  entries: DocumentEntry[];
  users?: User[];
}

export function OperatorActivity({ entries }: OperatorActivityProps) {
  // Group entries by user_id to get uploads per user
  const userActivity: Record<string, { uploads: number; department: string; lastEntry: string }> = {};

  entries.forEach((entry) => {
    if (!entry.user_id) return;

    const userId = entry.user_id.toString();
    if (!userActivity[userId]) {
      userActivity[userId] = { uploads: 0, department: entry.repartizare_dpt || "N/A", lastEntry: entry.created_at };
    }

    userActivity[userId].uploads++;
    
    // Track the most recent entry
    if (new Date(entry.created_at) > new Date(userActivity[userId].lastEntry)) {
      userActivity[userId].lastEntry = entry.created_at;
    }
  });

  const activityList = Object.entries(userActivity)
    .map(([userId, data]) => ({
      userId,
      ...data,
    }))
    .sort((a, b) => b.uploads - a.uploads)
    .slice(0, 6);

  if (activityList.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Operator Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            No activity yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" />
          Operator Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activityList.map((activity) => (
            <div key={activity.userId} className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-muted/20 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-semibold text-white">
                    {activity.userId.substring(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">User {activity.userId}</p>
                    <p className="text-xs text-muted-foreground">{activity.department}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="default">{activity.uploads} uploads</Badge>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(activity.lastEntry).toLocaleDateString("ro-RO")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
