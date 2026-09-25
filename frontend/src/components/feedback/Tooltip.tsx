import React from "react";
import { Tooltip as TooltipPrimitive, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  children?: React.ReactNode;
  content: React.ReactNode;
  placement?: "top" | "bottom";
  style?: React.CSSProperties;
}

/** Hover label for icon-only controls and chart points. Single line, no rich content. */
export function Tooltip({ children, content, placement = "top", style, ...rest }: TooltipProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <TooltipPrimitive>
        <TooltipTrigger asChild>
          <span className="inline-flex" style={style} {...rest}>
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side={placement === "bottom" ? "bottom" : "top"}
          className={cn(
            "text-caption text-text-primary bg-bg-elevated rounded-sm",
            "shadow-md z-40 pointer-events-none"
          )}
        >
          {content}
        </TooltipContent>
      </TooltipPrimitive>
    </TooltipProvider>
  );
}
