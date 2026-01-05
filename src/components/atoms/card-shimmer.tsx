"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { type ReactNode, memo } from "react";

export type CardShimmerProps = {
  children: ReactNode;
  className?: string;
  duration?: number;
  isActive?: boolean;
};

const CardShimmerComponent = ({
  children,
  className,
  duration = 2,
  isActive = true,
}: CardShimmerProps) => {
  if (!isActive) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      animate={{ backgroundPosition: "0% 50%" }}
      className={cn(
        "relative overflow-hidden",
        "bg-[length:200%_100%]",
        "[--bg:linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)]",
        "bg-[image:var(--bg)]",
        className
      )}
      initial={{ backgroundPosition: "100% 50%" }}
      transition={{
        repeat: Number.POSITIVE_INFINITY,
        duration,
        ease: "linear",
      }}
    >
      {children}
    </motion.div>
  );
};

export const CardShimmer = memo(CardShimmerComponent);
