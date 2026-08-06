import type { ReactNode } from "react";

interface SettingsRowProps {
  title: string;
  description?: string;
  children: ReactNode;
  divider?: boolean;
}

export function SettingsRow({ title, description, children, divider = true }: SettingsRowProps) {
  return (
    <div
      className={`flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:justify-between ${
        divider ? "border-b border-border" : ""
      }`}
    >
      <div className="sm:max-w-xs">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="w-full sm:w-80">{children}</div>
    </div>
  );
}

export function SettingsGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="space-y-0">
      {title && <h2 className="pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>}
      <div>{children}</div>
    </div>
  );
}