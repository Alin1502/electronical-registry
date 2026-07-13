import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: ReactNode;
  detail: string;
  delay?: number;
  valueClassName?: string;
}

export function StatCard({ title, value, detail, delay = 0, valueClassName }: StatCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }}>
      <Card className="h-full hover:-translate-y-0.5 hover:shadow-md transition-all">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={cn("break-words text-3xl font-semibold leading-tight tracking-tight", valueClassName)}>{value}</p>
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {detail}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
