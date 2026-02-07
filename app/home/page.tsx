"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Home, BarChart2, MessageSquare, User } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { PostCard } from "@/components/post-card"
import AnimatedLoadingSkeleton from "@/components/ui/loading-skeleton"
import { TopBar } from "@/components/top-bar"
import { Sidebar } from "@/components/sidebar"
import { TopLeaderboard } from "@/components/top-leaderboard"
import { RecentPosts } from "@/components/recent-posts"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface Post {
  id: string
  title: string
  body: string
  authorName: string
  authorHandle: string
  location?: string
  city?: string
  year: number
  category?: string
  priority: "High" | "Medium" | "Low"
  images: { src: string; alt: string }[]
  video: null
  likes: number
  dislikes: number
  comments: any[]
  shares: number
  status: string
  adminNote: string
  createdAt: number
}

type LeaderboardEntry = {
  id: string
  name: string
  image_url: string | null
  points: number
  city: string
  rank: number | null
}

export default function HomePage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("issues")
          .select("id, title, description, category, location_text, priority, status, created_at, reporter_name, photos")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Failed to load posts", error)
          return
        }

        const formattedPosts = (data || []).map(issue => {
          // Function to extract the actual path from a Supabase URL
          const extractPathFromUrl = (url: string) => {
            if (!url) return null;
            
            // If it's a stringified array (like "[\"https://..."]"), parse it first
            let parsedUrl = url;
            if (url.startsWith('["') && url.endsWith('"]')) {
              try {
                const parsed = JSON.parse(url);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  parsedUrl = parsed[0];
                }
              } catch (e) {
                console.error('Error parsing URL:', e);
                return null;
              }
            }

            // If it's already a full URL, extract the path after /storage/v1/object/public/
            const storagePath = parsedUrl.match(/\/storage\/v1\/object\/public\/(.+)/);
            if (storagePath && storagePath[1]) {
              return storagePath[1];
            }
            
            // If it's a direct path, return as is
            if (parsedUrl.startsWith('issue-photos/')) {
              return parsedUrl;
            }
            
            return null;
          };

          // Process photos array or single photo
          let images = [];
          const photos = Array.isArray(issue.photos) 
            ? issue.photos 
            : issue.photos 
              ? [issue.photos] 
              : [];

          images = photos
            .map((url: string) => {
              const path = extractPathFromUrl(url);
              const src = path 
                ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`
                : null;
              
              return src ? { 
                src, 
                alt: issue.title 
              } : null;
            })
            .filter((img): img is { src: string; alt: string } => img !== null);

          return {
            id: String(issue.id),
            title: issue.title,
            body: issue.description || "",
            authorName: issue.reporter_name || "Anonymous",
            authorHandle: `@user${issue.id.toString().slice(-4)}`,
            location: issue.location_text || undefined,
            city: undefined,
            year: new Date(issue.created_at).getFullYear(),
            category: issue.category || undefined,
            priority: (issue.priority?.charAt(0).toUpperCase() + issue.priority?.slice(1)) as "High" | "Medium" | "Low" || "Low",
            images,
            video: null,
            likes: 0,
            dislikes: 0,
            comments: [],
            shares: 0,
            status: issue.status || "pending",
            adminNote: "",
            createdAt: new Date(issue.created_at).getTime()
          };
        })

        setPosts(formattedPosts)
      } catch (err) {
        console.error("Error loading posts:", err)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLeaderboardLoading(true)
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .order('points', { ascending: false })
          .limit(10)

        if (error) throw error
        
        // Add ranking
        const rankedData = data.map((entry: any, index: number) => ({
          ...entry,
          rank: index + 1
        }))
        
        setLeaderboard(rankedData)
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setLeaderboardLoading(false)
      }
    }

    fetchLeaderboard()
  }, [supabase])


  return (
    <div className="md:flex">
      <Sidebar />
      <main className="min-h-dvh flex flex-col flex-1">
        <TopBar />
        <div className="min-h-screen bg-white">
          <div className="h-32 bg-gradient-to-b from-[#B8F1B0] to-white"></div>
          <div className="mx-auto w-full max-w-7xl px-4 md:px-8 -mt-20 relative z-10">
            <div className="flex flex-col lg:flex-row gap-20">
              {/* Main content - Posts */}
              <section className="flex-1 max-w-2xl">
                {posts.map((post) => (
                  <div key={post.id} className="mb-6">
                    <PostCard post={post} />
                  </div>
                ))}
                
                {loading && posts.length === 0 && (
                  <div className="mb-6">
                    <AnimatedLoadingSkeleton />
                  </div>
                )}
                
                {!loading && posts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="bg-muted rounded-full p-4 mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-12 w-12 text-muted-foreground"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium">No posts found</h3>
                    <p className="text-muted-foreground mt-2 mb-6 max-w-md">
                      There are no posts to display. Be the first to create one!
                    </p>
                    <Link
                      href="/posts/new"
                      className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                    >
                      Create Post
                    </Link>
                  </div>
                )}
                
                {posts.length > 0 && <div className="h-20" />}
              </section>

              {/* Right sidebar - Desktop only - Sticky */}
              <aside className="hidden lg:block w-80 space-y-6 sticky top-0 h-fit">
                <TopLeaderboard entries={leaderboard} isLoading={leaderboardLoading} />
                <RecentPosts posts={posts} isLoading={loading} />
              </aside>
            </div>
          </div>
        </div>
        

          <Link
            href="/posts/new"
            className="fixed right-4 bottom-24 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
          >
            <span className="sr-only">Create post</span>+
          </Link>
          
          <BottomNav />
      </main>
    </div>
  )
}