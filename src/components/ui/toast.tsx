'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 pr-8 shadow-xl backdrop-blur-sm transition-all duration-300 ease-out data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default:
          'border-border/50 bg-background/95 text-foreground backdrop-blur-md',
        destructive:
          'border-red-200/50 bg-red-50/95 text-red-900 backdrop-blur-md shadow-red-100/50',
        success:
          'border-emerald-200/50 bg-emerald-50/95 text-emerald-900 backdrop-blur-md shadow-emerald-100/50',
        warning:
          'border-amber-200/50 bg-amber-50/95 text-amber-900 backdrop-blur-md shadow-amber-100/50',
        info: 'border-blue-200/50 bg-blue-50/95 text-blue-900 backdrop-blur-md shadow-blue-100/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  onClose?: () => void
  title?: string
  description?: string
  icon?: React.ReactNode
  duration?: number
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      className,
      variant,
      title,
      description,
      icon,
      onClose,
      duration = 5000,
      ...props
    },
    ref
  ) => {
    React.useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          onClose?.()
        }, duration)
        return () => clearTimeout(timer)
      }
    }, [duration, onClose])

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <div className="flex items-start space-x-3">
          {icon && (
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm">
              {icon}
            </div>
          )}
          <div className="flex-1 space-y-1">
            {title && (
              <div className="text-sm font-semibold leading-tight tracking-tight">
                {title}
              </div>
            )}
            {description && (
              <div className="text-sm opacity-80 leading-relaxed">
                {description}
              </div>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-1.5 text-foreground/40 opacity-0 transition-all duration-200 hover:text-foreground hover:bg-white/10 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20 group-hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    )
  }
)
Toast.displayName = 'Toast'

export { Toast, toastVariants }
