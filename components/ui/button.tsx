import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "outline" | "ghost" | "accent" | "success" | "amber"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Design System v2.0 - Precisión Técnica Premium
    const variants = {
      default:
        "bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 shadow-sm shadow-teal-900/10 focus-visible:ring-teal-600/30",
      outline:
        "border border-zinc-200/80 bg-white text-zinc-900 hover:bg-zinc-50/80 active:bg-zinc-100 shadow-xs focus-visible:ring-zinc-400/30",
      ghost:
        "text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/70 active:bg-zinc-200/60 focus-visible:ring-zinc-400/30",
      accent:
        "bg-amber-500 text-white hover:bg-orange-500 active:bg-orange-600 shadow-sm shadow-amber-900/10 focus-visible:ring-amber-500/30",
      amber:
        "bg-amber-500 text-white hover:bg-orange-500 active:bg-orange-600 shadow-sm shadow-amber-900/10 focus-visible:ring-amber-500/30",
      success:
        "bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 shadow-sm shadow-emerald-900/10 focus-visible:ring-emerald-500/30",
    }
    
    const sizes = {
      default: "h-10 px-4 py-2 text-sm rounded-lg",
      sm: "h-8 px-3 text-xs rounded-md",
      lg: "h-11 px-6 text-sm md:text-base rounded-lg",
      icon: "h-10 w-10 rounded-lg",
    }

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-medium tracking-tight transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
