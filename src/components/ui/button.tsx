import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-base ease-out focus-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 elevation-1 hover:elevation-2 rounded-lg",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 elevation-1 hover:elevation-2 rounded-lg",
        outline: "border border-border bg-background hover:bg-muted hover:text-foreground elevation-1 hover:elevation-2 rounded-lg",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 elevation-1 hover:elevation-2 rounded-lg",
        ghost: "hover:bg-muted hover:text-foreground rounded-lg",
        link: "text-accent ink-underline font-normal",
        paper: "bg-card text-card-foreground border border-border paper-card rounded-xl",
        hero: "bg-primary text-primary-foreground hover:bg-primary/90 elevation-2 hover:elevation-3 rounded-xl font-semibold",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 elevation-1 hover:elevation-2 rounded-lg",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8 text-base rounded-xl",
        xl: "h-14 px-10 text-lg rounded-xl",
        icon: "h-11 w-11",
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
