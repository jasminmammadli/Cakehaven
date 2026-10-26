import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Pill input matching Figma "Component 12/13" (64px, black-300 border). The
 * design shows placeholder-only fields, so the label is visually hidden but
 * still announced, and errors appear below the field.
 */
export function Field({
  label,
  error,
  id,
  className,
  floatingLabel,
  ...props
}: ComponentProps<"input"> & { label: string; id: string; error?: string; floatingLabel?: boolean }) {
  const errorId = `${id}-error`;
  return (
    <div className={cn("relative flex flex-col gap-1", className)}>
      <label
        htmlFor={id}
        className={
          floatingLabel
            ? "absolute -top-2.5 left-[21px] z-10 bg-white px-2.5 text-caption text-black-500"
            : "sr-only"
        }
      >
        {label}
      </label>
      <Input
        id={id}
        placeholder={floatingLabel ? undefined : label}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="border-black-300 placeholder:text-black-500"
        {...props}
      />
      {error && (
        <p id={errorId} className="px-5 text-body2 text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
