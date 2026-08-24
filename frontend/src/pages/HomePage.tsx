import { AppFooter } from "@/components/layout/AppFooter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, FileKey, FileStack, History, Mail, ShieldCheck, SlidersHorizontal, Table2 } from "lucide-react";
import { motion } from "framer-motion";
import { CreditCard, LogIn, Settings2, FileUp, UserPlus, LayoutDashboard } from "lucide-react";

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

const timelineSteps = [
  {
    icon: CreditCard,
    title: "Cumperi accesul",
    detail: "Alegi planul potrivit pentru compania sau instituția ta.",
  },
  {
    icon: LogIn,
    title: "Intri în cont",
    detail: "Te autentifici ca administrator, cu acces complet din prima zi.",
  },
  {
    icon: Settings2,
    title: "Configurezi registrele",
    detail: "Alegi tipurile de registru și câmpurile de care ai nevoie.",
  },
  {
    icon: FileUp,
    title: "Adaugi documente",
    detail: "Încarci primele documente, cu numerotare automată.",
  },
  {
    icon: UserPlus,
    title: "Adaugi utilizatori",
    detail: "Inviți colegii și le atribui rolul potrivit fiecăruia.",
  },
  {
    icon: LayoutDashboard,
    title: "Gestionezi fluxul zilnic",
    detail: "Validezi, exporți și urmărești istoricul, tot dintr-un singur loc.",
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
    <div className="flex flex-col sm:flex-row gap-5">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-600 shadow-sm md:h-16 md:w-16">
        <Icon className="h-7 w-7 md:h-8 md:w-8" />
      </div>
      <div className="min-w-0 pt-1">
        <p className="text-lg font-bold tracking-tight text-foreground md:text-xl">{feature.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
          {feature.detail}
        </p>
      </div>
    </div>
  );
}

function ZigzagStep({ step, index }: { step: typeof timelineSteps[number]; index: number; }) {
  const Icon = step.icon;
  const isRight = index % 2 === 1;

  return (
    <div className="relative mb-12 md:mb-16 last:mb-0 w-full group">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center w-full justify-between">
        <div className="w-[calc(50%-2.5rem)] flex justify-end relative">
          {!isRight && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4 }}
              className="text-right w-full"
            >
              <div className="flex items-center justify-end gap-3 mb-2">
                <p className="text-lg font-bold text-foreground">{step.title}</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm ml-auto">
                {step.detail}
              </p>
            </motion.div>
          )}
          {!isRight && (
            <div className="absolute top-1/2 -translate-y-1/2 -right-10 w-10 border-t-2 border-dashed border-border/80" />
          )}
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10 pointer-events-none">
          <div className="h-4 w-4 rounded-full border-[2.5px] border-blue-600 bg-background ring-[6px] ring-background transition-transform group-hover:scale-125 duration-300" />
        </div>

        <div className="w-[calc(50%-2.5rem)] flex justify-start relative">
          {isRight && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4 }}
              className="text-left w-full"
            >
              <div className="flex items-center justify-start gap-3 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-lg font-bold text-foreground">{step.title}</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                {step.detail}
              </p>
            </motion.div>
          )}
          {isRight && (
            <div className="absolute top-1/2 -translate-y-1/2 -left-10 w-10 border-t-2 border-dashed border-border/80" />
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4 }}
        className="flex md:hidden gap-5 w-full relative z-10 px-6"
      >
        <div className="relative flex flex-col items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-blue-600 bg-background z-10 ring-4 ring-background shadow-sm">
            <Icon className="h-4 w-4 text-blue-600" />
          </div>
        </div>
        <div className="pt-1 pb-8">
          <p className="text-base font-bold text-foreground mb-1.5">{step.title}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{step.detail}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  const handleScrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-background text-foreground w-full">
      
      {/* HERO SECTION - Albastru puternic în fundal și pe text pentru a prevesti footer-ul */}
      <section className="relative w-full bg-background pt-24 pb-28 px-6 text-center md:pt-28 md:pb-32 overflow-hidden z-0">
        {/* Glow albastru central care luminează textul din spate */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/15 dark:bg-blue-600/20 rounded-[100%] blur-[100px] -z-10 pointer-events-none" />
        
        <div className="mx-auto max-w-4xl relative z-10">
          <h1 className="mt-8 text-4xl font-black uppercase leading-[0.92] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            <span className="block">Registratură</span>
            {/* Cuvântul "electronică" iese în evidență cu un gradient albastru specific footer-ului */}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-400 dark:from-blue-500 dark:to-blue-300">
              electronică
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
            Soluția Regix permite evidența unui registru electronic, repartizarea și controlul total
            asupra documentelor de intrare și ieșire din companie sau instituție, cu acces rapid de oriunde.
          </p>
          <a
            href="#features"
            onClick={handleScrollToFeatures}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-blue-600/25 transition-transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/30"
          >
            Detalii
          </a>
        </div>
      </section>

      <section id="features" className="w-full bg-muted/40 py-20 px-6 md:py-32 relative">
        <div className="mx-auto max-w-5xl relative z-10">
          <div className="mb-16 grid gap-8 md:grid-cols-[1fr_1fr] md:items-end">
            <div>
              <p className="text-blue-600 dark:text-blue-500 font-bold tracking-wider text-sm uppercase mb-3">Funcționalități</p>
              <h2 className="text-3xl font-black tracking-tight text-foreground md:text-5xl leading-tight">
                Tot ce ai nevoie ca să gestionezi registratura fără haos.
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground md:justify-self-end md:text-right md:text-base md:max-w-md pb-2">
              De la numerotare automată și control pe roluri până la exporturi, istoric și documente
              securizate, Regix ține tot fluxul într-un singur loc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14">
            {features.map((feature) => (
              <FeatureRow key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-background py-20 md:py-32">
        <div className="mx-auto max-w-4xl px-4 md:px-0 relative">
          <h2 className="text-3xl font-black tracking-tight text-center mb-16 md:mb-24 md:text-5xl">
            Cum funcționează
          </h2>
          <div className="hidden md:block absolute left-1/2 top-[120px] bottom-4 w-px border-l-2 border-dashed border-border/70 -translate-x-1/2" />
          <div className="md:hidden absolute left-[43px] top-[100px] bottom-4 w-px border-l-2 border-dashed border-border/70" />

          <div className="flex flex-col">
            {timelineSteps.map((step, index) => (
              <ZigzagStep key={step.title} step={step} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-background py-16 px-6 text-center">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-xl font-semibold mb-4">Cine dezvoltă Regix?</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            ...
          </p>
        </div>
      </section>

      <section className="w-full bg-accent/30 py-16 px-6 text-center">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-xl font-semibold mb-4">Despre noi</h2>
          <div className="max-w-xl mx-auto rounded-xl border border-dashed border-border px-6 py-8 bg-background/50">
            <p className="text-sm text-muted-foreground italic">
              Conținut în lucru — secțiune de completat.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full bg-background py-20 px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-black tracking-tight text-center mb-12 md:text-4xl">
            Întrebări frecvente
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={item.question} value={`item-${index}`} className="border-border">
                <AccordionTrigger className="text-left font-medium text-base hover:text-blue-600 transition-colors">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="w-full bg-muted/40 py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-10 md:gap-0 md:divide-x md:divide-border mb-10">
            
            <div className="md:pr-10 flex flex-col justify-center">
              <h2 className="text-2xl font-bold leading-snug text-foreground">
                Regix este dezvoltat continuu, pornind de la nevoi reale de gestiune a documentelor
                instituționale.
              </h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Scrie-ne și te contactăm, sau trimite direct un email la adresa de mai jos.
              </p>
              <div className="mt-6 flex items-center gap-3 text-base font-semibold bg-background text-foreground w-max px-5 py-2.5 rounded-full border border-border shadow-sm">
                <Mail className="h-5 w-5 text-blue-600" />
                support@regix.ro
              </div>
            </div>

            <div className="md:pl-10">
              <h3 className="text-lg font-bold mb-5 text-foreground">Solicită un demo și beneficiezi de:</h3>
              <ul className="space-y-4">
                {[
                  "Prezentare pe date de test, nu doar capturi de ecran",
                  "Poți întreba direct despre fluxul instituției tale",
                  "Fără nicio obligație de achiziție",
                  "Programare flexibilă, online",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm md:text-base text-muted-foreground">
                    <Check className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative bg-background rounded-2xl border border-border shadow-sm py-16 px-6 text-center mt-12 overflow-hidden">
            <div className="absolute top-0 left-0 h-10 w-10 border-t-4 border-l-4 border-blue-600 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 h-10 w-10 border-b-4 border-r-4 border-blue-600 rounded-br-2xl" />

            <h2 className="text-3xl font-black tracking-tight text-foreground relative z-10">Solicită un demo</h2>
            <p className="mt-4 text-base text-muted-foreground max-w-md mx-auto relative z-10">
              Vezi cum se potrivește Regix cu fluxul documentelor din instituția ta.
            </p>
            <a
              href="mailto:support@regix.ro"
              className="mt-8 inline-block rounded-full bg-blue-600 text-white text-sm font-bold uppercase tracking-wide px-10 py-4 shadow-lg shadow-blue-600/20 transition-transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/25 relative z-10"
            >
              Trimite email
            </a>
          </div>
        </div>
      </section>

      <AppFooter />
    </div>
  );
}