import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "dark" | "ghost";
  icon?: ReactNode;
};

export function Button({ className, children, icon, variant = "primary", ...props }: ButtonProps) {
  return (
    <button className={clsx("btn-base", `btn-${variant}`, className)} {...props}>
      {icon}
      <span>{children}</span>
    </button>
  );
}
