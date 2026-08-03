import { Globe, Mail, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function AppFooter() {
  return (
    <footer className="mt-16 border-t border-border/70 bg-card/70 py-12">
      <div className="container grid gap-8 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500 to-blue-500 text-xs font-bold text-white">
              RG
            </div>
            <span className="text-sm font-semibold">Regix</span>
          </div>
          <p className="text-sm text-muted-foreground">Calm, secure, and modern registry workspace.</p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Quick Links</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <Link className="block hover:text-foreground" to="/">Home</Link>
            <Link className="block hover:text-foreground" to="/">Terms and Conditions</Link>
            <Link className="block hover:text-foreground" to="/">Admin</Link>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Contact</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>support@regix.ro</p>
            <p>+40 677 677 676</p>
            <p>Bulevardul Metalurgiei, Romania</p>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Social</h4>
          <div className="flex gap-2 text-muted-foreground">
            <a href="#" className="rounded-md border border-border p-2 hover:text-foreground"><Globe className="h-4 w-4" /></a>
            <a href="#" className="rounded-md border border-border p-2 hover:text-foreground"><MessageCircle className="h-4 w-4" /></a>
            <a href="#" className="rounded-md border border-border p-2 hover:text-foreground"><Mail className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="container mt-8 border-t border-border/70 pt-6 text-xs text-muted-foreground">
        Copyright © {new Date().getFullYear()} Regix. All rights reserved.
      </div>
    </footer>
  );
}
