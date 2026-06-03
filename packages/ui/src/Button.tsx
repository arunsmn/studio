"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@studio/utils";

interface ButtonProps {
  variant?: "primary" | "ghost" | "pill";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-violet-600 text-white hover:bg-violet-700 rounded-lg",
  ghost:
    "border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",
  pill: "rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onClick,
  children,
  type = "button",
  className,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}
