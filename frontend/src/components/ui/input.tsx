import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 text-sm text-text-primary placeholder:text-text-muted transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn("text-sm font-medium text-text-secondary", className)} {...props} />
  )
);
Label.displayName = "Label";
