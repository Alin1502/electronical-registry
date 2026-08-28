import { useEffect, useState } from "react";
import { getEntryHistory } from "@/api/client";
import type { HistoryEvent } from "@/types/registry";

const STATUS_LABELS: Record<string, string> = {
  registered: "Registered",
  assigned: "Assigned",
  reviewed: "Reviewed",
  returned: "Returned for corrections",
  resubmitted: "Resubmitted",
  closed: "Closed",
};

export function DocumentTimeline({ entryId }: { entryId: number }) {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEntryHistory(entryId)
      .then(setEvents)
      .finally(() => setLoading(false));
  }, [entryId]);

  if (loading) return <div className="text-sm text-muted-foreground">Istoricul se încarcă…</div>;

  return (
    <div className="flex flex-col">
      {events.map((event, i) => (
        <div key={event.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="h-2.5 w-2.5 rounded-full bg-[--brand-blue]" />
            {i < events.length - 1 && <div className="w-px flex-1 bg-border" />}
          </div>
          <div className="pb-4">
            <p className="font-mono text-xs text-muted-foreground">
              {new Date(event.created_at).toLocaleString("ro-RO", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
            <p className="font-serif text-sm">{STATUS_LABELS[event.status] ?? event.status}</p>
            {event.note && <p className="text-xs text-muted-foreground">{event.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}