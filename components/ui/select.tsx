import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "min-h-12 w-full appearance-none rounded-xl border border-[#cddbd5] bg-white px-4 text-base text-[#173b3f] outline-none transition focus:border-[#173b3f] focus:ring-4 focus:ring-[#f4b942]/25",
        className,
      )}
      {...props}
    />
  );
}

