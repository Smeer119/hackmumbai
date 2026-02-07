"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { Home, BarChart2, MessageSquare, User } from "lucide-react"
import { PostForm } from "@/components/post-form"
import { DEMO_USER, newPostTemplate, upsertPost } from "@/lib/local-db"

export default function NewPostPage() {
  const router = useRouter()

  return (
    <main className="min-h-dvh flex flex-col">
      <section className="mx-auto w-full max-w-2xl px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Create Post</h1>
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <PostForm />
          </CardContent>
        </Card>
      </section>

      <BottomNav />
    </main>
  )
}
