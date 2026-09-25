import React from "react";
import { Dialog as DialogPrimitive, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface DialogProps {
  open?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /** escape hatch: exact max-width in px — dialogs are sized per-content, not off Tailwind's fixed width scale */
  width?: number;
  onClose?: () => void;
  style?: React.CSSProperties;
}

/** Modal over a blurred scrim. Positioned absolutely — give the mount an explicit position:relative. */
export function Dialog({ open = true, title, description, children, footer, onClose, width = 480, style, ...rest }: DialogProps) {
  if (!open) return null;

  const contentClass = cn("w-full");

  return (
    <DialogPrimitive open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
      <DialogContent
        showCloseButton={!!onClose}
        className={contentClass}
        style={{ maxWidth: `${width}px`, ...style }}
        {...rest}
      >
        {title && (
          <DialogHeader>
            <DialogTitle className="text-h3 tracking-tight">{title}</DialogTitle>
          </DialogHeader>
        )}
        {description && (
          <DialogDescription className="text-body-s text-text-secondary">
            {description}
          </DialogDescription>
        )}
        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}
        {footer && (
          <DialogFooter className="flex flex-row justify-end gap-3 mt-8">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </DialogPrimitive>
  );
}
