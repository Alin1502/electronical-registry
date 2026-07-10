import { useEffect, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
}

export function AnimatedCounter({ value, suffix = "" }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let current = 0;
    const duration = 900;
    const stepMs = 20;
    const steps = Math.max(1, Math.floor(duration / stepMs));
    const increment = value / steps;

    const id = window.setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(id);
      } else {
        setDisplay(Math.floor(current));
      }
    }, stepMs);

    return () => clearInterval(id);
  }, [value]);

  return (
    <span>
      {display.toLocaleString("ro-RO")}
      {suffix}
    </span>
  );
}
