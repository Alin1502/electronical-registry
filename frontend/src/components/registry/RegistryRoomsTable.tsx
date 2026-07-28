import { ChevronRight } from "lucide-react";

interface RegistryRoom {
  code: string;
  label: string;
}

interface RegistryRoomsProps {
  rooms: RegistryRoom[];
  onSelectRoom?: (code: string) => void;
}

export function RegistryRoomsTable({ rooms, onSelectRoom }: RegistryRoomsProps) {
  return (
    <div className="space-y-2">
      {rooms.map((room) => (
        <button
          key={room.code}
          type="button"
          onClick={() => onSelectRoom?.(room.code)}
          className="flex w-full items-center justify-between rounded-xl px-1 py-4 text-left transition-colors hover:bg-muted/40"
        >
          <span className="text-lg font-medium text-foreground">{room.label}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}
