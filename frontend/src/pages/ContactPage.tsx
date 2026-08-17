import { useState } from "react";
import { Mail, MapPin, Send, MessageSquarePlus } from "lucide-react";
import { AppFooter } from "@/components/layout/AppFooter";
import emailCampaignImage from "@/images/Email campaign-pana.png";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactPage() {
  const [showForm, setShowForm] = useState(false);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!consent) {
      return;
    }

    const subject = encodeURIComponent(`Mesaj de la ${firstName} ${lastName} prin Regix`);
    const body = encodeURIComponent(
      `Nume: ${lastName}\nPrenume: ${firstName}\nCompanie: ${company || "N/A"}\nTelefon: ${phone}\nEmail: ${email}\n\nMesaj:\n${message}`
    );
    window.location.href = `mailto:support@regix.ro?subject=${subject}&body=${body}`;
  }

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-background text-foreground">
      <section className="flex w-full flex-1 justify-center px-6 py-20 md:py-28 lg:py-32">
        <div className="grid w-full max-w-6xl grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-20">
          
          {/* Left Side: Illustration (Sticky so it stays visible while scrolling the form) */}
          <div className="flex w-full flex-col items-center justify-center lg:sticky lg:top-32">
            <img
              src={emailCampaignImage}
              alt="Ilustrație contact"
              className="mx-auto h-auto w-full max-w-[500px] object-contain drop-shadow-2xl"
            />
          </div>

          {/* Right Side: Content & Animated Form Reveal */}
          <div className="flex w-full flex-col justify-center pt-4 lg:pt-10">
            <h1 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
              Contactează-ne
            </h1>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground max-w-lg">
              Ai o întrebare despre Regix sau vrei să discutăm despre nevoile instituției tale?
              Suntem aici să te ajutăm să eficientizezi fluxul de documente.
            </p>

            <AnimatePresence mode="wait">
              {!showForm ? (
                <motion.div
                  key="contact-cta"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                  transition={{ duration: 0.3 }}
                  className="mt-10"
                >
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-primary px-10 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30"
                  >
                    <MessageSquarePlus className="h-5 w-5" />
                    Lasă-ne un mesaj
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="contact-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="mt-10 overflow-hidden"
                >
                  {/* Quick Contact Info Strip */}
                  <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border/50 bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-around">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Email</p>
                        <a href="mailto:support@regix.ro" className="text-muted-foreground hover:text-primary transition-colors">
                          support@regix.ro
                        </a>
                      </div>
                    </div>
                    <div className="hidden h-10 w-px bg-border/50 sm:block" />
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Locație</p>
                        <p className="text-muted-foreground">România</p>
                      </div>
                    </div>
                  </div>

                  {/* The Form - Now entirely vertical */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-semibold">Nume</label>
                      <input
                        id="lastName"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm transition-colors focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Popescu"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-semibold">Prenume</label>
                      <input
                        id="firstName"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm transition-colors focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Andrei"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="company" className="text-sm font-semibold">
                        Nume Companie <span className="font-normal text-muted-foreground">(Opțional)</span>
                      </label>
                      <input
                        id="company"
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm transition-colors focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Compania S.R.L."
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-semibold">Nr. telefon</label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm transition-colors focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="07XX XXX XXX"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-semibold">Email</label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm transition-colors focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="adresa@email.ro"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-semibold">Mesaj</label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full resize-none rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm transition-colors focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Cum te putem ajuta?"
                      />
                    </div>

                    <div className="pt-1">
                      <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                          required
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary accent-primary"
                        />
                        <span>
                          Am citit și sunt de acord cu
                          <a href="#" className="mx-1 font-medium text-primary underline-offset-4 hover:underline">
                            politica de confidențialitate
                          </a>
                          și
                          <a href="#" className="ml-1 font-medium text-primary underline-offset-4 hover:underline">
                            termenii și condițiile
                          </a>.
                        </span>
                      </label>
                    </div>

                    <div className="pt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 sm:w-auto"
                      >
                        <Send className="h-4 w-4" />
                        Trimite mesajul
                      </button>
                      <p className="text-xs leading-relaxed text-muted-foreground sm:max-w-[220px]">
                        Se va deschide clientul tău de email, cu mesajul precompletat.
                      </p>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>
        </div>
      </section>

      <AppFooter />
    </div>
  );
}