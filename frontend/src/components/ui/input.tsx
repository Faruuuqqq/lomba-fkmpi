import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-14 w-full rounded-none border-4 border-bauhaus bg-white px-4 py-3 text-lg font-medium ring-offset-background file:border-4 file:border-bauhaus file:bg-transparent file:text-base file:font-bold placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bauhaus-red focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
