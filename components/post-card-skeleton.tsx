import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PostCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-5 w-full max-w-md" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="mt-4 flex gap-2">
          <Skeleton className="h-48 w-72 rounded-lg" />
          <Skeleton className="h-48 w-72 rounded-lg" />
        </div>

        <div className="my-4">
          <Skeleton className="h-px w-full" />
        </div>

        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-12" />
        </div>
      </CardContent>
    </Card>
  )
}
