import { useState } from "react";
import { Mail, MapPin } from "lucide-react";
import { AppFooter } from "@/components/layout/AppFooter";

function FullBleedSection({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen ${className ?? ""}`}>
      <div className="max-w-4xl mx-auto px-6">{children}</div>
    </section>
  );
}

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Mesaj de la ${name || "cineva"} prin Regix`);
    const body = encodeURIComponent(
      `Nume: ${name}\nEmail: ${email}\n\n${message}`
    );
    window.location.href = `mailto:support@regix.ro?subject=${subject}&body=${body}`;
  }

  return (
    <div className="bg-background text-foreground">
      <FullBleedSection className="bg-background py-20 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Contact</h1>
        <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Ai o întrebare despre Regix sau vrei să discutăm despre nevoile instituției tale?
          Scrie-ne direct.
        </p>
      </FullBleedSection>

      <FullBleedSection className="bg-muted/60 py-16">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <h2 className="text-xl font-semibold mb-6">Trimite-ne un mesaj</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                  Nume
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1.5">
                  Mesaj
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-md bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 transition-opacity hover:opacity-90"
              >
                Trimite
              </button>
              <p className="text-xs text-muted-foreground">
                Trimiterea deschide clientul tău de email, cu mesajul precompletat.
              </p>
            </form>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-6">Detalii de contact</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href="mailto:support@regix.ro" className="hover:underline">
                  support@regix.ro
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                România
              </div>
            </div>
          </div>
        </div>
      </FullBleedSection>

      <AppFooter />
    </div>
  );
}