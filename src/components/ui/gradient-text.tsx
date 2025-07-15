"use client";

import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
  animate?: boolean;
}

export function GradientText({
  children,
  className,
  gradient = "from-blue-600 via-purple-600 to-cyan-500",
  animate = true,
}: GradientTextProps) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        gradient,
        animate && "animate-gradient-x",
        className,
      )}
    >
      {children}
    </span>
  );
}
