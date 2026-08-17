import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";

const mainLinks = [
  { label: "Acasă", to: "/" },
  { label: "Servicii", to: "/#services" },
  { label: "Despre Noi", to: "/despre-noi" },
  { label: "Contact Us", to: "/contact" },
];

// Custom SVG Icons for Brands to avoid lucide-react version issues
function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-[#0a0f1c] text-slate-300 py-16 overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-16 lg:gap-32">
          
          <div className="flex flex-col gap-8 max-w-md">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-white rounded-md p-1">
                <img src="/REGIX_LOGO.png" alt="Regix Logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-xl font-bold tracking-wide text-white">REGIX</p>
                <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                  Registratură Electronică
                </p>
              </div>
            </div>

            {/* Short About */}
            <p className="text-sm leading-relaxed text-slate-400">
              Misiunea noastră este să democratizăm accesul la unelte digitale performante, 
              simplificând managementul documentelor și arhivarea electronică pentru 
              instituții și companii din întreaga țară.
            </p>

            {/* Contact Details */}
            <div className="flex flex-col gap-3 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:support@regix.ro" className="hover:text-primary transition-colors">
                  support@regix.ro
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+40700000000" className="hover:text-primary transition-colors">
                  +40 700 000 000
                </a>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin className="h-4 w-4 text-primary" />
                București, România
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-4 pt-2">
              <a 
                href="#" 
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition-all hover:border-primary hover:bg-primary hover:text-white"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition-all hover:border-red-500 hover:bg-red-500 hover:text-white"
                aria-label="YouTube"
              >
                <YoutubeIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end justify-center gap-5">
            {mainLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="group relative flex items-center text-3xl font-medium text-slate-200 transition-colors hover:text-white lg:text-4xl"
              >
                <span className="absolute -left-6 h-2 w-2 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>
            Copyright {currentYear} © Regix, Toate drepturile rezervate
          </p>

          <div className="flex items-center gap-4">
            <Link to="/politica-de-confidentialitate" className="hover:text-slate-300 hover:underline underline-offset-4 transition-colors">
              Politica de Confidențialitate
            </Link>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <Link to="/termeni-si-conditii" className="hover:text-slate-300 hover:underline underline-offset-4 transition-colors">
              Termeni și Condiții
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}