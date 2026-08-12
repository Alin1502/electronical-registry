import { AppFooter } from "@/components/layout/AppFooter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, FileKey, FileStack, History, Mail, ShieldCheck, SlidersHorizontal, Table2 } from "lucide-react";
interface Feature {
  icon: typeof FileStack;
  title: string;
  detail: string;
}

const features: Feature[] = [
  {
    icon: FileStack,
    title: "Numerotare automată",
    detail: "Numărul de înregistrare și codul se generează automat, per zi și per tip de registru.",
  },
  {
    icon: ShieldCheck,
    title: "Control acces pe roluri",
    detail: "Fiecare utilizator vede și acționează doar ce permite rolul lui în companie.",
  },
  {
    icon: Table2,
    title: "Export Excel dinamic",
    detail: "Rapoarte generate direct din datele înregistrate, adaptate la câmpurile fiecărui registru.",
  },
  {
    icon: FileKey,
    title: "Documente criptate",
    detail: "Documentele sensibile pot fi protejate cu cod de acces și criptare dedicată.",
  },
  {
    icon: History,
    title: "Istoric complet",
    detail: "Fiecare modificare a unei înregistrări este păstrată, cu autor și dată.",
  },
  {
    icon: SlidersHorizontal,
    title: "Registre configurabile",
    detail: "Câmpurile fiecărui tip de registru pot fi adaptate la nevoile companiei.",
  },
];

const faqItems = [
  {
    question: "Poate platforma gestiona mai multe departamente sau tipuri de registru?",
    answer:
      "Da. Fiecare companie are propriile tipuri de registru, configurabile independent, iar accesul utilizatorilor este controlat pe roluri și, opțional, pe departamente.",
  },
  {
    question: "Cum se face exportul pentru verificări sau control?",
    answer:
      "Exportul Excel se generează direct din datele înregistrate, pentru un interval de date ales, respectând structura de câmpuri configurată pentru tipul de registru respectiv.",
  },
  {
    question: "Cât durează integrarea unei echipe noi?",
    answer:
      "Adăugarea utilizatorilor se face prin invitație pe email, cu rolul stabilit din start de administrator. Nu este nevoie de configurare tehnică din partea utilizatorilor noi.",
  },
];

function FeatureRow({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <div className="flex gap-5 py-7 md:py-8">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/10 bg-primary/10 text-primary shadow-sm md:h-16 md:w-16">
        <Icon className="h-7 w-7 md:h-8 md:w-8" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-semibold tracking-tight text-foreground md:text-xl">{feature.title}</p>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
          {feature.detail}
        </p>
      </div>
    </div>
  );
}

// Full-bleed wrapper: breaks the section out of MainLayout's max-w-7xl container
// so the background color reaches the actual viewport edges.
function FullBleedSection({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen ${className ?? ""}`}>
      <div className="max-w-4xl mx-auto px-6">{children}</div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="bg-background text-foreground">
      <FullBleedSection className="relative isolate overflow-hidden bg-background pt-24 pb-28 text-center md:pt-28 md:pb-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.85),rgba(255,255,255,0.28)_42%,transparent_72%)]" />
        <div className="pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full bg-white/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 top-28 h-64 w-64 rounded-full bg-white/45 blur-3xl" />

        <div className="relative mx-auto max-w-4xl">
          <h1 className="mt-8 text-4xl font-black uppercase leading-[0.92] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            <span className="block">Registratură</span>
            <span className="block">electronică</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
            Soluția Regix permite evidența unui registru electronic, repartizarea și controlul total
            asupra documentelor de intrare și ieșire din companie sau instituție, cu acces rapid de oriunde.
          </p>

          <a
            href="#features"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25"
          >
            Detalii
          </a>
        </div>

      </FullBleedSection>

      <FullBleedSection id="features" className="bg-muted/55 py-20 md:py-24">
        <div className="mb-12 grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div>
            <p className="section-subtitle">Funcționalități</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-foreground md:text-5xl">
              Tot ce ai nevoie ca să gestionezi registratura fără haos.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground md:justify-self-end md:text-right md:text-base md:leading-8">
            De la numerotare automată și control pe roluri până la exporturi, istoric și documente
            securizate, Regix ține tot fluxul într-un singur loc.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-0 divide-y divide-border/60 border-y border-border/60 bg-background/55 px-2 md:px-6">
          {features.map((feature) => (
            <FeatureRow key={feature.title} feature={feature} />
          ))}
        </div>
      </FullBleedSection>

      <FullBleedSection className="bg-background py-16 text-center">
        <h2 className="text-xl font-semibold mb-4">Cine dezvoltă Regix?</h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Regix este dezvoltat independent, ca proiect propriu, pornind de la nevoi reale întâlnite
          în gestiunea registraturii instituționale.
        </p>
      </FullBleedSection>

      <FullBleedSection className="bg-accent/40 py-16 text-center">
        <h2 className="text-xl font-semibold mb-4">Despre noi</h2>
        <div className="max-w-xl mx-auto rounded-md border border-dashed border-border px-6 py-8">
          <p className="text-sm text-muted-foreground italic">
            Conținut în lucru — secțiune de completat.
          </p>
        </div>
      </FullBleedSection>

      <FullBleedSection className="bg-background py-16">
        <h2 className="text-xl font-semibold text-center mb-10">Întrebări frecvente</h2>
        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={item.question} value={`item-${index}`} className="border-border">
                <AccordionTrigger className="text-left font-medium">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </FullBleedSection>

        <FullBleedSection className="bg-muted/60 py-16">
        <div className="grid md:grid-cols-2 gap-10 md:gap-0 md:divide-x md:divide-border mb-10">
          <div className="md:pr-10">
            <h2 className="text-xl font-bold leading-snug">
              Regix este dezvoltat continuu, pornind de la nevoi reale de gestiune a documentelor
              instituționale.
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Scrie-ne și te contactăm, sau trimite direct un email la adresa de mai jos.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
              <Mail className="h-4 w-4 text-primary" />
              support@regix.ro
            </div>
          </div>

          <div className="md:pl-10">
            <h3 className="text-base font-bold mb-4">Solicită un demo și beneficiezi de:</h3>
            <ul className="space-y-3">
              {[
                "Prezentare pe date de test, nu doar capturi de ecran",
                "Poți întreba direct despre fluxul instituției tale",
                "Fără nicio obligație de achiziție",
                "Programare flexibilă, online",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative bg-background rounded-md py-16 px-6 text-center">
          <div className="absolute -top-1 -left-1 h-8 w-8 border-t-2 border-l-2 border-primary" />
          <div className="absolute -bottom-1 -right-1 h-8 w-8 border-b-2 border-r-2 border-primary" />

          <h2 className="text-2xl font-bold">Solicită un demo</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Vezi cum se potrivește Regix cu fluxul documentelor din instituția ta.
          </p>
          <a
            href="mailto:support@regix.ro"
            className="mt-6 inline-block rounded-md bg-primary text-primary-foreground text-sm font-semibold uppercase tracking-wide px-6 py-3 transition-opacity hover:opacity-90"
          >
            Solicită demo
          </a>
        </div>
      </FullBleedSection>

      <AppFooter />
    </div>
  );
}