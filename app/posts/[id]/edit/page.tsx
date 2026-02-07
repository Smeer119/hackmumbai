"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { Home, BarChart2, MessageSquare, User } from "lucide-react"
import { PostForm } from "@/components/post-form"
import { getPost, upsertPost } from "@/lib/local-db"

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const post = getPost(params.id)

  if (!post) {
    return (
      <main className="min-h-dvh grid place-items-center px-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Post not found.</p>
          <Button className="mt-3" onClick={() => router.replace("/home")}>
            Go Home
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <section className="mx-auto w-full max-w-2xl px-4 py-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Edit Post</CardTitle>
          </CardHeader>
          <CardContent>
            <PostForm
              initial={post}
              onSubmit={(p) => {
                upsertPost(p)
                router.replace("/home")
              }}
            />
            <Button variant="ghost" className="mt-2" onClick={() => router.back()}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      </section>

      <BottomNav
        items={[
          { href: "/home", label: "Home", icon: Home },
          { href: "/analytics", label: "Analytics", icon: BarChart2 },
          { href: "/aichat", label: "AI Chat", icon: MessageSquare },
          { href: "/profile", label: "Profile", icon: User },
        ]}
      />
    </main>
  )
}
