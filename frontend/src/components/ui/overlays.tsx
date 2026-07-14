import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Dropdown Menu
export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;

export function DropdownMenuContent({
  className,
  ...props
}: DropdownPrimitive.DropdownMenuContentProps) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        sideOffset={8}
        className={cn(
          "z-50 min-w-[180px] glass-strong rounded-xl p-1.5 shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
}

export function DropdownMenuItem({ className, ...props }: DropdownPrimitive.DropdownMenuItemProps) {
  return (
    <DropdownPrimitive.Item
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-text-secondary outline-none transition-colors hover:bg-white/10 hover:text-text-primary data-[disabled]:opacity-40",
        className
      )}
      {...props}
    />
  );
}
export const DropdownMenuSeparator = () => <DropdownPrimitive.Separator className="my-1 h-px bg-white/10" />;

// Tabs
export const Tabs = TabsPrimitive.Root;
export function TabsList({ className, ...props }: TabsPrimitive.TabsListProps) {
  return <TabsPrimitive.List className={cn("inline-flex gap-1 rounded-xl glass p-1", className)} {...props} />;
}
export function TabsTrigger({ className, ...props }: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "rounded-lg px-3.5 py-1.5 text-sm font-medium text-text-secondary transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white",
        className
      )}
      {...props}
    />
  );
}
export const TabsContent = TabsPrimitive.Content;

// Tooltip
export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export function TooltipContent({ className, ...props }: TooltipPrimitive.TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={6}
        className={cn("z-50 rounded-lg glass-strong px-2.5 py-1.5 text-xs text-text-primary shadow-xl", className)}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

// Select
export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;
export function SelectTrigger({ className, children, ...props }: SelectPrimitive.SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="h-4 w-4 text-text-muted" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}
export function SelectContent({ className, children, ...props }: SelectPrimitive.SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn("z-50 overflow-hidden rounded-xl glass-strong p-1.5 shadow-2xl", className)}
        {...props}
      >
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}
export function SelectItem({ className, children, ...props }: SelectPrimitive.SelectItemProps) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-2.5 text-sm text-text-secondary outline-none hover:bg-white/10 hover:text-text-primary data-[state=checked]:text-text-primary",
        className
      )}
      {...props}
    >
      <span className="absolute left-2.5 inline-flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-3.5 w-3.5 text-primary-light" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

// Switch
export function Switch({ className, ...props }: SwitchPrimitive.SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative h-6 w-11 rounded-full bg-white/10 transition-colors data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-secondary",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-md transition-transform data-[state=checked]:translate-x-[22px]" />
    </SwitchPrimitive.Root>
  );
}
