import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DocumentEntry, User } from "@/types/registry";

interface OperatorActivityProps {
  entries: DocumentEntry[];
  users?: User[];
}

export function OperatorActivity({ entries, users }: OperatorActivityProps) {
  const userActivity: Record<string, { uploads: number; department: string; lastEntry: string }> = {};

  entries.forEach((entry) => {
    if (!entry.user_id) return;

    const userId = entry.user_id.toString();
    if (!userActivity[userId]) {
      userActivity[userId] = { uploads: 0, department: entry.repartizare_dpt || "N/A", lastEntry: entry.created_at };
    }

    userActivity[userId].uploads++;
    
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

  // Helper function to map the ID to the real username
  const getUserName = (id: string) => {
    if (!users) return `User ${id}`;
    const foundUser = users.find((u) => u.id.toString() === id);
    return foundUser ? foundUser.username : `User ${id}`;
  };

  if (activityList.length === 0) {
    return (
      <div className="flex flex-col border border-border bg-background p-5 rounded-md">
        <h3 className="text-sm font-medium mb-4 text-foreground flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          Operator Activity
        </h3>
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          No activity yet
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border border-border bg-background p-5 rounded-md">
      <h3 className="text-sm font-medium mb-4 text-foreground flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        Operator Activity
      </h3>
      <div className="space-y-2 mt-2">
        {activityList.map((activity) => {
          const displayName = getUserName(activity.userId);
          
          return (
            <div key={activity.userId} className="flex items-center justify-between rounded-md p-3 hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-medium text-muted-foreground capitalize">
                    {displayName.substring(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{activity.department}</p>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <Badge variant="secondary" className="font-normal text-xs">{activity.uploads} uploads</Badge>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {new Date(activity.lastEntry).toLocaleDateString("ro-RO")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}