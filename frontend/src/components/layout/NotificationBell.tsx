import { Bell, FileSignature, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export interface PendingNotification {
  id: number;
  entry_id: number;
  username: string;
  register_type: string;
  created_at: string;
  nr_inregistrare: string;
}

export interface RoleNotification {
  id: number;
  type: "role_removed" | "role_updated";
  message: string;
  is_read: boolean;
  created_at: string;
}

type MergedItem =
  | { kind: "validation"; data: PendingNotification }
  | { kind: "role"; data: RoleNotification };

interface NotificationBellProps {
  validationNotifications: PendingNotification[];
  roleNotifications: RoleNotification[];
  onOpen?: () => void;
}

export function NotificationBell({ validationNotifications, roleNotifications, onOpen }: NotificationBellProps) {
  const navigate = useNavigate();

  const merged: MergedItem[] = [
    ...validationNotifications.map((data) => ({ kind: "validation" as const, data })),
    ...roleNotifications.map((data) => ({ kind: "role" as const, data })),
  ].sort((a, b) => new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime());

  const unreadRoleCount = roleNotifications.filter((n) => !n.is_read).length;
  const totalCount = validationNotifications.length + unreadRoleCount;

  function handleValidationClick(notif: PendingNotification) {
    navigate(`/records/${encodeURIComponent(notif.register_type)}`, {
      state: { targetSearch: notif.nr_inregistrare },
    });
  }

  return (
    <div className="relative group z-50" onMouseEnter={() => onOpen?.()}>
      <button className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
        <Bell className="h-4 w-4" />
        {totalCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
            {totalCount}
          </span>
        )}
      </button>

      <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right">
        <div className="w-80 rounded-md border border-border bg-card shadow-lg overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-3">
            <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
            {totalCount > 0 && (
              <Badge variant="secondary" className="text-xs font-normal">{totalCount} new</Badge>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {merged.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                You're all caught up!
              </div>
            ) : (
              <div className="divide-y divide-border">
                {merged.map((item) =>
                  item.kind === "validation" ? (
                    <button
                      key={`v-${item.data.id}`}
                      onClick={() => handleValidationClick(item.data)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="mt-0.5 rounded-full bg-amber-500/15 p-1.5 text-amber-600">
                        <FileSignature className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-foreground leading-snug">
                          New validation request from <span className="font-medium">{item.data.username}</span> in{" "}
                          <span className="font-medium capitalize">{item.data.register_type}</span>.
                        </p>
                        <span className="text-xs text-muted-foreground">Click to review</span>
                      </div>
                    </button>
                  ) : (
                    <div key={`r-${item.data.id}`} className="flex items-start gap-3 px-4 py-3 text-left">
                      <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">
                        <UserCog className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-foreground leading-snug">{item.data.message}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.data.created_at).toLocaleString("ro-RO")}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}