import { Bell, FileSignature } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

// This interface expects your backend to send slightly enriched data
// (e.g., joining the user table to get the actual username)
export interface PendingNotification {
  id: number;
  entry_id: number;
  username: string;
  register_type: string;
  created_at: string;
  nr_inregistrare: string; 
}

interface NotificationBellProps {
  notifications: PendingNotification[];
}

export function NotificationBell({ notifications }: NotificationBellProps) {
  const navigate = useNavigate();
  const unreadCount = notifications.length;

  function handleNotificationClick(notif: PendingNotification) {
    navigate(`/records/${notif.register_type}`, {
      state: { 
        targetSearch: notif.nr_inregistrare 
      }
    });
  }

  return (
    <div className="relative group z-50">
      {/* The Bell Button */}
      <button className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
            {unreadCount}
          </span>
        )}
      </button>

      {/* The Dropdown Menu (Triggered by hover) */}
      {/* The pt-2 creates an invisible bridge so the hover doesn't break when moving the mouse down */}
      <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right">
        <div className="w-80 rounded-md border border-border bg-card shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-3">
            <h4 className="text-sm font-semibold text-foreground">Validation Queue</h4>
            <Badge variant="secondary" className="text-xs font-normal">
              {unreadCount} pending
            </Badge>
          </div>

          {/* List */}
          <div className="max-h-[300px] overflow-y-auto">
            {unreadCount === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                You're all caught up!
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)} 
                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                    >
                    <div className="mt-0.5 rounded-full bg-amber-500/15 p-1.5 text-amber-600">
                      <FileSignature className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-foreground leading-snug">
                        New validation request from <span className="font-medium">{notif.username}</span> in <span className="font-medium capitalize">{notif.register_type}</span>.
                      </p>
                      <span className="text-xs text-muted-foreground">
                        Click to review
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}