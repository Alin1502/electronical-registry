import { motion } from "framer-motion";
import { CheckCircle2, Shield, Sparkles, Workflow, Zap, Database, Lock } from "lucide-react";
import { AppFooter } from "@/components/layout/AppFooter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const trustStats = [
  { value: "99.99%", label: "System Uptime" },
  { value: "50k+", label: "Documents Processed" },
  { value: "< 200ms", label: "Query Latency" },
  { value: "AES-256", label: "Encrypted Storage" },
];

const services = [
  {
    title: "Electronic Registry",
    text: "Instantly digitize incoming and outgoing document flows with automated indexing.",
    icon: Workflow,
  },
  {
    title: "RBAC Security",
    text: "Strict Role-Based Access Control ensures users only see what their clearance allows.",
    icon: Shield,
  },
  {
    title: "Data Export & Audit",
    text: "Generate compliance-ready Excel reports and full operational audit logs on demand.",
    icon: Database,
  },
];

const timeline = [
  { step: "01", title: "Intake", text: "Upload documents and assign registry metadata." },
  { step: "02", title: "Routing", text: "Dispatch to the correct department with status flags." },
  { step: "03", title: "Execution", text: "Operators process the task and update resolution states." },
  { step: "04", title: "Archival", text: "Immutable records are securely stored for compliance." },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Hero Section */}
      <section className="container relative z-10 pt-24 pb-16 md:pt-32 md:pb-24">
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible" 
          className="flex flex-col items-center text-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
            <Sparkles className="mr-2 h-4 w-4" />
            Next-Generation Registry System
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl text-foreground">
            Operational registry built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">high-throughput</span> environments.
          </motion.h1>
          
          <motion.p variants={itemVariants} className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Eliminate administrative friction. A heavily structured, secure, and lightning-fast platform designed to handle your organization's entire document lifecycle.
          </motion.p>
          
          <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105">
              Access Dashboard
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base transition-all hover:bg-muted">
              View Architecture
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container relative z-10 border-t border-border/50 py-12">
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {trustStats.map((item) => (
            <motion.div key={item.label} variants={itemVariants} className="flex flex-col items-center justify-center p-4">
              <p className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground">{item.value}</p>
              <p className="mt-1 text-sm font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Bento Grid Features (Replacing the stupid placeholder) */}
      <section className="container py-20">
        <div className="flex flex-col gap-2 mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Engineered for Scale</h2>
          <p className="text-muted-foreground">Robust infrastructure masked by a minimalist interface.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3 md:grid-rows-2">
          {/* Large Feature Card */}
          <Card className="md:col-span-2 md:row-span-2 overflow-hidden group relative border-border/50 bg-gradient-to-br from-background to-muted/20 hover:border-primary/50 transition-colors">
            <CardContent className="p-8 h-full flex flex-col justify-end">
              <Zap className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Zero-Latency Data Retrieval</h3>
              <p className="text-muted-foreground max-w-md">
                Optimized relational queries and efficient state management ensure that even when filtering through tens of thousands of registry entries, the interface responds instantly.
              </p>
            </CardContent>
          </Card>

          {/* Small Feature Cards */}
          <Card className="group border-border/50 bg-background hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <Lock className="h-6 w-6 text-cyan-500 mb-4" />
              <h3 className="font-semibold mb-2">Immutable Audit Trails</h3>
              <p className="text-sm text-muted-foreground">Every document modification is securely logged, timestamped, and tied directly to the operator's session token.</p>
            </CardContent>
          </Card>

          <Card className="group border-border/50 bg-background hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <Workflow className="h-6 w-6 text-blue-500 mb-4" />
              <h3 className="font-semibold mb-2">Microservice Ready</h3>
              <p className="text-sm text-muted-foreground">Designed with a decoupled frontend that communicates strictly via secure API endpoints, allowing for scalable deployment.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="container py-20">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Core Capabilities</h2>
        </div>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-3"
        >
          {services.map((service) => (
            <motion.div key={service.title} variants={itemVariants}>
              <Card className="h-full border-border/50 bg-background hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{service.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Process Timeline */}
      <section id="process" className="container py-20 border-t border-border/50">
        <h2 className="text-3xl font-bold tracking-tight mb-12">Data Flow Pipeline</h2>
        <div className="grid gap-6 md:grid-cols-4 relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2 z-0" />
          {timeline.map((step, i) => (
            <div key={step.step} className="relative z-10 bg-background pt-4 md:pt-0">
              <span className="text-5xl font-black text-muted/30 absolute -top-8 -left-2 z-0 select-none">{step.step}</span>
              <Card className="relative z-10 border-border/50 h-full">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-2">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container py-20 border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">Technical FAQ</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-border/50">
              <AccordionTrigger className="text-left font-medium">Is the platform capable of handling multi-departmental logic?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Yes. The database schema is designed to isolate entries by department and register type, while the RBAC system ensures operators only interface with records assigned to their specific organizational unit.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-border/50">
              <AccordionTrigger className="text-left font-medium">How is data extracted for compliance reviews?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                The application supports strictly formatted Excel and PDF generation. All exports maintain the chronological integrity of the registry and include requisite tracking numbers.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-border/50">
              <AccordionTrigger className="text-left font-medium">What is the expected onboarding time?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                The interface strips away unnecessary complexity. Because it maps directly to real-world registry workflows (Intake, Routing, Resolution), technical onboarding is typically completed within a single session.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <AppFooter />
    </div>
  );
}