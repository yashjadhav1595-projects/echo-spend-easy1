import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#23243a]/60 via-[#4de3c1]/30 to-[#6c63ff]/30 text-[#4de3c1] border border-[#4de3c1] hover:bg-[#23243a]/80 hover:text-[#b3baff] shadow-lg backdrop-blur transition-all duration-200",
        destructive:
          "bg-gradient-to-r from-[#ff1744]/60 to-[#ff4081]/60 text-white border border-[#ff4081] hover:bg-[#ff1744]/80 hover:text-[#ffd6e0] shadow-lg backdrop-blur transition-all duration-200",
        outline:
          "border border-[#4de3c1] bg-transparent hover:bg-[#23243a]/40 hover:text-[#4de3c1] shadow-md backdrop-blur transition-all duration-200",
        secondary:
          "bg-gradient-to-r from-[#23243a]/60 to-[#6c63ff]/40 text-[#b3baff] border border-[#35365a] hover:bg-[#23243a]/80 hover:text-[#4de3c1] shadow-lg backdrop-blur transition-all duration-200",
        ghost: "bg-transparent hover:bg-[#4de3c1]/10 text-[#4de3c1] border border-transparent hover:border-[#4de3c1] shadow transition-all duration-200",
        link: "text-[#4de3c1] underline-offset-4 hover:underline hover:text-[#b3baff] transition-all duration-200",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
