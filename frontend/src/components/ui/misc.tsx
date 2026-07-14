import type { HTMLAttributes, ReactNode } from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { AlertTriangle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";
import { Button } from "./button";

export function Badge({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function Avatar({ name, src, size = 36 }: { name: string; src?: string; size?: number }) {
  return (
    <AvatarPrimitive.Root
      className="inline-flex select-none items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-secondary text-white font-medium"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {src && <AvatarPrimitive.Image src={src} alt={name} className="h-full w-full object-cover" />}
      <AvatarPrimitive.Fallback>{initials(name || "U")}</AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-text-muted">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <div className="space-y-1">
        <p className="font-medium text-text-primary">{title}</p>
        {description && <p className="text-sm text-text-secondary max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-danger/20 bg-danger/5 p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-text-primary">Something went wrong</p>
        <p className="text-sm text-text-secondary max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
