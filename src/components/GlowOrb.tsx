import { cn } from "@/lib/utils";

interface GlowOrbProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const GlowOrb = ({ className, size = "md" }: GlowOrbProps) => {
  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-64 h-64",
    lg: "w-96 h-96",
  };

  return (
    <div
      className={cn(
        "absolute rounded-full bg-primary/20 blur-3xl animate-pulse-slow pointer-events-none",
        sizeClasses[size],
        className
      )}
    />
  );
};
