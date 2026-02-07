"use client"
import { useState } from "react"
import { usePosts } from "@/hooks/use-posts"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

type Props = {
  postId: string
  open: boolean
  onOpenChange: (v: boolean) => void
  author?: string
  image?: string
  text?: string
}

export function CommentsDialog({ postId, open, onOpenChange, author, image, text }: Props) {
  const { posts, comment } = usePosts()
  const p = posts.find((x) => x.id === postId)
  const [value, setValue] = useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image || "/placeholder.svg"}
                alt="Post image"
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              <div className="p-4 text-sm text-muted-foreground">{text}</div>
            )}
          </div>
          <div className="flex max-h-[60vh] flex-col">
            <div className="flex-1 overflow-y-auto rounded-md border p-3">
              {(p?.comments || []).map((c) => (
                <div key={c.id} className="mb-3">
                  <div className="text-sm font-medium">
                    {c.user}{" "}
                    <span className="ml-2 text-xs text-muted-foreground">{new Date(c.ts).toLocaleString()}</span>
                  </div>
                  <div className="text-sm">{c.text}</div>
                </div>
              ))}
            </div>
            <DialogFooter className="mt-2">
              <form
                className="flex w-full items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!value.trim()) return
                  comment(postId, "You", value.trim())
                  setValue("")
                }}
              >
                <input
                  className="flex-1 rounded-md border px-3 py-2 text-sm"
                  placeholder="Add a comment..."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
                <button className="rounded-md bg-primary px-3 py-2 text-sm text-background">Post</button>
              </form>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
