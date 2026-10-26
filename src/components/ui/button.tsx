import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// Variants follow the Figma "Frame 55" component set (Ui kit, node 52:252):
// Default (filled lilac), Secondary (outlined) and Link, plus the 54px arrow circle.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-3 rounded-pill border border-transparent font-sans font-normal whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-lilac-700 text-white hover:bg-lilac-800 active:bg-lilac-900",
        strong: "bg-lilac-800 text-white hover:bg-lilac-900 active:bg-lilac-950",
        outline: "border-black-500 bg-white text-black-500 hover:bg-lilac-50 active:bg-lilac-100",
        "outline-lilac": "border-lilac-700 bg-white text-black-500 hover:bg-lilac-50 active:bg-lilac-100",
        link: "text-lilac-800 hover:text-lilac-900 hover:underline underline-offset-4",
        ghost: "text-black-500 hover:bg-lilac-50",
        circle: "border-black-500 bg-white text-black-500 hover:bg-lilac-100 disabled:opacity-40",
      },
      size: {
        lg: "h-[68px] px-[50px] text-h3",
        md: "h-16 px-8 text-body1",
        sm: "h-11 px-5 text-body1",
        icon: "size-[54px] p-0 [&_svg]:size-6",
        "icon-sm": "size-10 p-0 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "lg",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "lg",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
