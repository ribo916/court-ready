import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function Card({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "rounded-lg border border-hairline bg-panel p-5 shadow-sm sm:p-6",
        className
      )}
      {...props}
    >
      {children}
    </section>
  )
}

type CardHeadingProps = {
  eyebrow: string
  title: ReactNode
  icon?: LucideIcon
  iconClassName?: string
  action?: ReactNode
}

export function CardHeading({
  eyebrow,
  title,
  icon: Icon,
  iconClassName,
  action,
}: CardHeadingProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-ink-muted">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-semibold text-ink">{title}</h2>
      </div>
      {action}
      {Icon ? (
        <Icon
          className={cn("size-6 shrink-0 text-brand", iconClassName)}
          aria-hidden="true"
        />
      ) : null}
    </div>
  )
}
