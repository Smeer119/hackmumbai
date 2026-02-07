"use client"

import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Post } from "@/lib/local-db"

export interface Issue {
  id: number
  title: string
  description: string
  category: string | null
  location_text: string | null
  priority: "high" | "medium" | "low" | null
  status: "open" | "in_progress" | "resolved" | "closed"
  contact_info: string | null
  reporter_id: string
  reporter_name: string | null
  created_at: string
  photos: string | null
  owner: string | null
  country: string | null
  state: string | null
  city: string | null
  station: string | null
  latitude: number | null
  longitude: number | null
  pollutant_id: string | null
  Date: string | null
}

const POSTS_LIMIT = 50 // Increased limit to get more posts at once

function issueToPost(issue: Issue): Post {
  let images: { src: string; alt: string }[] = []
  if (issue.photos) {
    try {
      const photoUrls = JSON.parse(issue.photos)
      images = Array.isArray(photoUrls) 
        ? photoUrls.map((url: string) => ({ src: url, alt: issue.title }))
        : []
    } catch {
      images = [{ src: issue.photos, alt: issue.title }]
    }
  }

  return {
    id: String(issue.id),
    title: issue.title,
    body: issue.description,
    authorName: issue.reporter_name || "Anonymous",
    authorHandle: `@user${issue.reporter_id.slice(0, 8)}`,
    location: issue.location_text || undefined,
    city: issue.city || undefined,
    year: new Date(issue.created_at).getFullYear(),
    category: issue.category || undefined,
    priority: issue.priority 
      ? (issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)) as "High" | "Medium" | "Low"
      : "Low",
    images,
    video: null,
    likes: 0,
    dislikes: 0,
    comments: [],
    shares: 0,
    status: issue.status === "open" 
      ? "pending" 
      : issue.status === "resolved" 
      ? "solved" 
      : issue.status as any,
    adminNote: "",
    createdAt: new Date(issue.created_at).getTime(),
  }
}

export function useIssues() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAllPosts = useCallback(async () => {
    if (loading) {
      console.log('⏸️ Already loading, skipping...')
      return
    }

    console.log('📥 [FETCH] Loading all posts')
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from("issues")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(POSTS_LIMIT)

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      console.log(`✅ [SUCCESS] Fetched ${data?.length || 0} posts`)
      if (data && data.length > 0) {
        const formattedPosts = data.map(issueToPost)
        setPosts(formattedPosts)
      } else {
        setPosts([])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch posts'
      console.error('❌ [ERROR] Failed to fetch posts:', errorMessage)
      setError(errorMessage)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [loading])

  // Initial load
  useEffect(() => {
    console.log("🚀 [INIT] Component mounted, loading all posts")
    fetchAllPosts()
    
    return () => {
      console.log("🧹 [CLEANUP] Cleaning up...")
    }
  }, [fetchAllPosts])

  const refresh = useCallback(async () => {
    console.log("🔄 [REFRESH] Refreshing all data")
    await fetchAllPosts()
    console.log("✅ [REFRESH] Refresh complete")
  }, [fetchAllPosts])

  const likePost = useCallback((id: string) => {
    console.log(`❤️ [LIKE] Liking post ${id}`)
    setPosts(prev => 
      prev.map(p => 
        p.id === id ? { ...p, likes: p.likes + 1 } : p
      )
    )
  }, [])

  const deletePost = useCallback(async (id: string) => {
    try {
      console.log(`🗑️ [DELETE] Deleting issue ${id}`)
      const { error } = await supabase
        .from("issues")
        .delete()
        .eq("id", Number(id))

      if (error) {
        throw error
      }

      console.log(`✅ [DELETE] Issue ${id} deleted successfully`)
      setPosts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error("❌ [DELETE ERROR] Error deleting post:", err)
    }
  }, [])

  const share = useCallback((id: string) => {
    console.log(`📤 [SHARE] Sharing post ${id}`)
    setPosts(prev => 
      prev.map(p => 
        p.id === id ? { ...p, shares: (p.shares || 0) + 1 } : p
      )
    )
  }, [])

  return {
    posts,
    loading,
    error,
    refresh,
    likePost,
    deletePost,
    share
  }
}