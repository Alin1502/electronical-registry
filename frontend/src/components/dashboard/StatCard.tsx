import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: ReactNode;
  detail: string;
  delay?: number;
  valueClassName?: string;
}

export function StatCard({ title, value, detail, delay = 0, valueClassName }: StatCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay, duration: 0.35 }}
      className="flex flex-col justify-center p-5 sm:p-6 bg-background"
    >
      <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
      <p className={cn("break-words text-3xl font-semibold leading-tight tracking-tight text-foreground", valueClassName)}>
        {value}
      </p>
      <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
        <ArrowUpRight className="h-3 w-3 opacity-70" />
        {detail}
      </p>
    </motion.div>
  );
}