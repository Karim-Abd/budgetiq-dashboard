import Image from "next/image";

import { cn } from "@/lib/utils";
import { apiPath } from "@/lib/base-path";

// The BudgetIQ W mark (transparent PNG in /public). unoptimized keeps it a plain
// asset request so it proxies cleanly under the /dashboard base path — but it
// also opts out of next/image's automatic basePath prefixing, so the src has to
// carry /dashboard itself or it 404s.
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src={apiPath("/logo.png")}
      alt="BudgetIQ"
      width={36}
      height={36}
      unoptimized
      priority
      className={cn("h-9 w-9 shrink-0 object-contain", className)}
    />
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-tight">
          Budget<span className="text-growth">IQ</span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Operating System
        </div>
      </div>
    </div>
  );
}
