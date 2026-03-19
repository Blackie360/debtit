import { mw } from 'motionwind-react'

function Skeleton ({ className, ...props }: React.ComponentProps<'div'>) {
  const base = 'bg-accent animate-pulse rounded-md'
  return (
    <mw.div
      data-slot="skeleton"
      className={className ? `${base} ${className}` : base}
      {...props}
    />
  )
}

export { Skeleton }
