import { cn } from "@/lib/utils"

export function PriorityBadge({ level }: { level: "High" | "Medium" | "Low" }) {
  const styles = {
    High: "bg-accent text-accent-foreground",
    Medium: "bg-secondary text-secondary-foreground",
    Low: "bg-muted text-muted-foreground",
  } as const

  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border", styles[level])}
      aria-label={`${level} priority`}
    >
      {level}
    </span>
  )
}
