import { motion } from "framer-motion";
import { CheckCircle2, Shield, Sparkles, Workflow } from "lucide-react";
import { AppFooter } from "@/components/layout/AppFooter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const trustStats = [
  { value: "99.98%", label: "Platform Uptime" },
  { value: "12k+", label: "Registry Entries / Month" },
  { value: "48%", label: "Faster Processing Time" },
  { value: "4.9/5", label: "Operational Satisfaction" },
];

const services = [
  {
    title: "Electronic Registry",
    text: "Record incoming and outgoing documents, assign the register, and keep the PDF linked.",
    icon: Workflow,
  },
  {
    title: "Secure Operations",
    text: "Restrict access, log actions, and preserve the audit trail for each record.",
    icon: Shield,
  },
  {
    title: "Effortless Automation",
    text: "Generate numbers, apply defaults, and export the data when needed.",
    icon: Sparkles,
  },
];

const timeline = [
  { title: "01. Intake", text: "Upload the PDF, choose the register, and save the entry." },
  { title: "02. Routing", text: "Select the department and set the handling status." },
  { title: "03. Resolution", text: "Enter the outcome and keep the history attached to the record." },
  { title: "04. Reporting", text: "Export Excel or PDF files when the register needs review." },
];

export default function HomePage() {
  return (
    <>
      <section className="container py-16 md:py-24">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="section-subtitle">Premium Electronic Registry</p>
          <h1 className="page-title mt-4 max-w-3xl">
            Calm, trustworthy registry operations built for teams that handle records all day.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
            A modern SaaS-style interface for electronic registratura: organized, lightweight, and comfortable for long admin sessions.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg">Open Dashboard</Button>
            <Button size="lg" variant="outline">Schedule Demo</Button>
          </div>
        </motion.div>
      </section>

      <section className="container">
        <div className="grid gap-4 md:grid-cols-4">
          {trustStats.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card>
                <CardContent className="p-6">
                  <p className="text-3xl font-semibold tracking-tight text-primary">{item.value}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardContent className="p-8">
              <p className="section-subtitle">About</p>
              <h2 className="mt-3 text-2xl font-semibold">Designed with Scandinavian calm and healthcare-grade clarity.</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                This platform removes visual fatigue from administrative operations through whitespace, soft contrasts, and predictable interaction patterns.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Readable hierarchy with intentional spacing",
                  "Soft cards and subtle interaction feedback",
                  "Accessible contrast and responsive behavior",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-50 to-blue-50">
            <CardContent className="p-8">
              <p className="section-subtitle">Placeholder</p>
              <h3 className="mt-3 text-2xl font-semibold">Hero-side Illustration Space</h3>
              <p className="mt-4 text-sm text-muted-foreground">
                Placeholder block for branded visuals, product screenshot, or animated dashboard preview.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="services" className="container pb-16">
        <p className="section-subtitle">Services</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:-translate-y-0.5 hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <service.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 text-lg font-semibold">{service.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{service.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="process" className="container pb-16">
        <p className="section-subtitle">Process Timeline</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {timeline.map((step) => (
            <Card key={step.title}>
              <CardContent className="p-6">
                <h4 className="font-semibold">{step.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="faq" className="container pb-8">
        <p className="section-subtitle">FAQ</p>
        <Card className="mt-4">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="space-y-3">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is this suitable for municipal or healthcare departments?</AccordionTrigger>
                <AccordionContent>Yes. It is designed for high-volume administrative environments requiring traceability and ease of use.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Can teams export official reports?</AccordionTrigger>
                <AccordionContent>Yes. Excel and bulk PDF export are available in the dashboard workflow.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Do we need staff training?</AccordionTrigger>
                <AccordionContent>The interface is intentionally straightforward and usually adopted without formal training.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </section>

      <AppFooter />
    </>
  );
}
