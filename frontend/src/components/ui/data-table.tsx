import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T extends { [key: string]: any }>({
  columns,
  data,
  rowKey,
  isLoading,
  skeletonRows = 6,
  onRowClick,
}: {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  skeletonRows?: number;
  onRowClick?: (row: T) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn("px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted", col.className)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {isLoading &&
              Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="skeleton h-4 w-full max-w-[160px] rounded" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading &&
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "transition-colors hover:bg-white/[0.03]",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3.5 align-middle text-text-primary", col.className)}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
