"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/services/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    value={value}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    {/* NOTE: diverges from upstream shadcn — uses insetInlineStart instead of
    translateX so the bar fills from the correct edge in RTL, and forwards
    `value` to Radix so aria-valuenow is set. Do not overwrite with shadcn add. */}
    <ProgressPrimitive.Indicator
      className="absolute h-full w-full flex-1 bg-primary transition-all"
      style={{ insetInlineStart: `-${100 - (value || 0)}%` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
