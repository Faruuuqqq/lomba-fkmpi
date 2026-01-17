import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-none border-2 border-bauhaus px-3 py-1 text-xs font-black uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-bauhaus focus:ring-offset-0",
  {
    variants: {
      variant: {
        default:
          "border-bauhaus bg-bauhaus-red text-white hover:bg-bauhaus-red/90",
        secondary:
          "border-bauhaus bg-bauhaus-blue text-white hover:bg-bauhaus-blue/90",
        destructive:
          "border-bauhaus bg-black text-white hover:bg-gray-800",
        outline: "border-bauhaus bg-transparent text-bauhaus hover:bg-bauhaus-yellow",
        success:
          "border-bauhaus bg-green-600 text-white hover:bg-green-700",
        warning:
          "border-bauhaus bg-bauhaus-yellow text-bauhaus hover:bg-yellow-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
