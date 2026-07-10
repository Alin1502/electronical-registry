import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  admin: "Administrare",
  login: "Autentificare",
};

export function Breadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);

  if (parts.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
      <Link to="/" className="hover:text-foreground">Home</Link>
      {parts.map((part, index) => {
        const href = `/${parts.slice(0, index + 1).join("/")}`;
        const label = labelMap[part] ?? part;
        const isCurrent = index === parts.length - 1;

        return (
          <span className="flex items-center gap-2" key={href}>
            <ChevronRight className="h-4 w-4" />
            {isCurrent ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link to={href} className="hover:text-foreground">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
