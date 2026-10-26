import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

// Pill input from the Figma "Component 6" set (Ui kit, node 59:1637): 64px tall,
// 1px border, 20px horizontal padding, Body1 text.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-16 w-full min-w-0 rounded-pill border border-black-500 bg-white px-5 text-body1 text-black-500 transition-colors outline-none placeholder:text-black-300 focus-visible:border-lilac-800 focus-visible:ring-3 focus-visible:ring-lilac-700/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
