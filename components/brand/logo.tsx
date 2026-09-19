import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

type LogoMarkProps = SVGProps<SVGSVGElement> & { size?: number };

export function LogoMark({ className, size = 40, ...props }: LogoMarkProps) {
  return (
    <svg aria-hidden="true" className={cn("shrink-0", className)} height={size} viewBox="0 0 192 192" width={size} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="192" height="192" rx="42" fill="#173B3F" />
      <path d="M48 60h70c14 0 26 12 26 26v46H74c-14 0-26-12-26-26V60Z" fill="#F4B942" />
      <path d="M72 48h52c11 0 20 9 20 20v9H72c-11 0-20-9-20-20s9-9 20-9Z" fill="#FFFDF8" />
      <path d="M92 80h40M92 103h31" stroke="#173B3F" strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, markSize = 40 }: { className?: string; markSize?: number }) {
  return <span className={cn("inline-flex items-center gap-3", className)}><LogoMark size={markSize} /><span className="text-xl font-black tracking-[-0.04em]">nexpire</span></span>;
}

