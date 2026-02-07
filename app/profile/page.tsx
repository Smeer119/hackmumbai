"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BottomNav } from "@/components/bottom-nav"
import { TopBar } from "@/components/top-bar"
import { Camera } from "lucide-react"
import { useState, useMemo, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Sidebar } from "@/components/sidebar"
import { ProfileData, Post, getProfileFromDB, getPosts, saveProfile, getPostsFromDB } from "@/lib/local-db"
import { Input } from "@/components/ui/input"
import AnimatedLoadingSkeleton from "@/components/ui/loading-skeleton"
import { useAuth } from "@/components/auth-provider"
import { useConfirm } from "@/components/confirm-provider"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

function ProfileHeader({ profileData, postsCount, editing, onAvatarClick }: { profileData: ProfileData, postsCount: number, editing: boolean, onAvatarClick: () => void }) {
  return (
    <section className="relative">
      <div className="h-24 w-full rounded-b-2xl bg-primary/10" />
      <div className="mx-auto max-w-2xl px-4">
        <div className="-mt-10 flex items-end gap-4">
          <div className="relative">
            <Avatar className={`size-20 ring-2 ring-background ${editing ?"cursor-pointer" : ""}`} onClick={editing ? onAvatarClick : undefined}>
              <AvatarImage src={profileData.avatar || "/professional-headshot.png"} alt="Profile" />
              <AvatarFallback>{profileData.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            {editing && (
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 border-2 border-background">
                <Camera size={16} className="text-gray-600" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">{profileData.name}</h1>
            <p className="text-sm text-muted-foreground">{profileData.handle}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="inline-flex items-center">{profileData.profession || "🎨 Designer & Painter"}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(profileData.interests || ["Football", "Arts & Crafts", "Handicrafts"]).map((chip) => (
            <span
              key={chip}
              className="rounded-full border px-3 py-1 text-xs text-muted-foreground"
              aria-label={`Interest ${chip}`}
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="mt-3 text-sm text-muted-foreground">
          <strong className="text-foreground">{postsCount}</strong> posts
        </div>
      </div>
    </section>
  )
}

function SamplePost({ post, onClick }: { post: Post; onClick?: () => void }) {
  return (
    <Card className="cursor-pointer" onClick={onClick}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-medium">{post.title}</div>
            <div className="text-xs text-muted-foreground">{post.authorName} {post.authorHandle ? <span className="ml-1 text-muted-foreground">{post.authorHandle}</span> : null}</div>
          </div>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
            {(post.status || "pending").replace("_", " ")}
          </span>
        </div>
        {post.status === "rejected" && post.adminNote ? (
          <p className="mt-2 text-xs text-destructive">Reason: {post.adminNote}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

function CommentCard({ postId, title, text }: { postId: string; title: string; text: string }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="text-xs text-muted-foreground">On: {title}</div>
        <div className="text-sm">{text}</div>
      </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [editing, setEditing] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [editedBio, setEditedBio] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [editedInterests, setEditedInterests] = useState("")
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true)
        if (!user) {
          // Guest user data
          setProfileData({
            id: 'guest',
            name: 'Guest User',
            handle: '@guest',
            email: '',
            avatar: "/placeholder-user.jpg",
            
            bio: "Welcome to CityPulse!",
            profession: "Community Member",
            interests: ["Community", "Technology"],
            coins: 0
          })
          setPosts([])
        } else {
          // Always try to get the reporter_name from posts to match the display name in posts
          let reporterName: string | null = null
          try {
            const { data: recent, error: recentErr } = await supabase
              .from('issues')
              .select('reporter_name')
              .eq('reporter_id', user!.id)
              .order('created_at', { ascending: false })
              .limit(1)

            if (!recentErr && Array.isArray(recent) && recent.length > 0) {
              const rn = recent[0]?.reporter_name
              if (rn && typeof rn === 'string' && rn.trim()) reporterName = rn.trim()
            }
          } catch (e) {
            // ignore
          }

          const profile = await getProfileFromDB(user!.id)

          if (profile) {
            // Update profile name to match posts display if reporter_name is available
            setProfileData({
              ...profile,
              name: reporterName || profile.name
            })
          } else {
            // Fallback to metadata/email if no reporter_name found
            const displayName = reporterName || user!.user_metadata?.full_name || user!.user_metadata?.name || user!.email || "User"

            setProfileData({
              id: user!.id,
              name: displayName,
              handle: `@${user!.email?.split('@')[0] || 'user'}`,
              email: user!.email || "",
              avatar: user!.user_metadata?.avatar_url || "/placeholder-user.jpg",
              bio: "Welcome to CityPulse!",
              profession: "Community Member",
              interests: ["Community", "Technology"],
              coins: 0
            })
          }
        }
      } catch (error) {
        console.error('Error loading profile data:', error)
        // Fallback to guest data on error
        setProfileData({
          id: 'guest',
          name: 'Guest User',
          handle: '@guest',
          email: '',
          avatar: "/placeholder-user.jpg",
          bio: "Welcome to CityPulse!",
          profession: "Community Member",
          interests: ["Community", "Technology"],
          coins: 0
        })
        setPosts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadProfileData()
  }, [user, router])

  // Load posts when profile data is available
  useEffect(() => {
    const loadPostsData = async () => {
      if (!profileData) return

      try {
        console.debug('[Profile] loadPostsData - profile id:', profileData.id)

        // Load posts from issues table for the profile user
        let issuesData: any[] | null = []
        let error: any = null

        // If this is the guest profile, there is no reporter_id to match in DB
        if (profileData.id === 'guest') {
          issuesData = []
        } else {
          // Try matching by reporter_id first; if many existing rows have null reporter_id
          // (legacy data), also attempt to match by reporter_name (fallback).
          const matchById = await supabase
            .from('issues')
            .select('id, title, description, category, location_text, priority, status, created_at, reporter_name, reporter_id, photos')
            .eq('reporter_id', profileData.id)
            .order('created_at', { ascending: false })

          if (matchById.error) {
            // record error but continue to try fallback
            error = matchById.error
          }

          if (matchById.data && matchById.data.length > 0) {
            issuesData = matchById.data
          } else {
            // Fallback: try matching by reporter_name (some legacy posts only stored the name)
            const nameToMatch = profileData.name || profileData.handle?.replace(/^@/, '') || null
            if (nameToMatch) {
              const safeName = nameToMatch.replace(/"/g, '')
              const matchByName = await supabase
                .from('issues')
                .select('id, title, description, category, location_text, priority, status, created_at, reporter_name, reporter_id, photos')
                // use ilike to match substrings and avoid exact equality issues
                .or(`reporter_name.ilike.%${safeName}%,reporter_name.ilike.%@${safeName}%`)
                .order('created_at', { ascending: false })

              if (matchByName.error) {
                // record error
                error = matchByName.error
              }
              issuesData = matchByName.data || []
            } else {
              issuesData = []
            }
          }
        }

  console.debug('[Profile] Supabase query result count:', issuesData?.length ?? 0, 'error:', error)

        if (error) {
          console.error('Failed to load user posts', error)
          setPosts([])
          return
        }

        const formattedPosts = (issuesData || []).map((issue: any) => {
          const extractPathFromUrl = (url: string) => {
            if (!url) return null
            let parsedUrl = url
            if (url.startsWith('["') && url.endsWith('"]')) {
              try {
                const parsed = JSON.parse(url)
                if (Array.isArray(parsed) && parsed.length > 0) parsedUrl = parsed[0]
              } catch (e) {
                console.error('Error parsing URL:', e)
                return null
              }
            }
            const storagePath = parsedUrl.match(/\/storage\/v1\/object\/public\/(.+)/)
            if (storagePath && storagePath[1]) return storagePath[1]
            if (parsedUrl.startsWith('issue-photos/')) return parsedUrl
            return null
          }

          const photos = Array.isArray(issue.photos) ? issue.photos : issue.photos ? [issue.photos] : []
          const images = photos
            .map((url: string) => {
              const path = extractPathFromUrl(url)
              const src = path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}` : null
              return src ? { src, alt: issue.title } : null
            })
            .filter((img: any) => img !== null)

          return {
            id: String(issue.id),
            title: issue.title,
            body: issue.description || '',
            // Prefer the original post's reporter_name (full name) when available,
            // otherwise fall back to the profile's name.
            authorName: issue.reporter_name || profileData.name || 'Anonymous',
            authorHandle: profileData.handle,
            reporterId: issue.reporter_id,
            location: issue.location_text || undefined,
            city: undefined,
            year: new Date(issue.created_at).getFullYear(),
            category: issue.category || undefined,
            priority: (issue.priority?.charAt(0).toUpperCase() + issue.priority?.slice(1)) as 'High' | 'Medium' | 'Low' || 'Low',
            images,
            video: null,
            likes: 0,
            dislikes: 0,
            comments: [],
            shares: 0,
            status: issue.status || 'pending',
            adminNote: '',
            createdAt: new Date(issue.created_at).getTime(),
          }
        })

        // Merge with local posts for comments
        const localPosts = getPosts()
        console.debug('[Profile] localPosts count:', localPosts.length)
        const mergedPosts = formattedPosts.map((post: any) => {
          const localPost = localPosts.find(lp => lp.id === post.id)
          if (localPost) console.debug('[Profile] merging comments for post id:', post.id, 'local comments:', (localPost.comments || []).length)
          return localPost ? { ...post, comments: localPost.comments } : post
        })

        console.debug('[Profile] mergedPosts count:', mergedPosts.length)
        setPosts(mergedPosts)
      } catch (error) {
        console.error('Error loading posts data:', error)
        setPosts([])
      }
    }

    loadPostsData()
  }, [profileData])

  const myPosts = useMemo(() => {
    return posts.filter((p) => {
      const reporterId = (p as any).reporterId
      if (reporterId && profileData?.id) return reporterId === profileData.id
      return p.authorHandle === profileData?.handle
    })
  }, [posts, profileData])
  const myComments = useMemo(() => {
    // Extract comments from user's posts
    return myPosts.flatMap(post =>
      (post.comments || []).map(comment => ({
        postId: post.id,
        title: post.title,
        text: comment.text
      }))
    )
  }, [myPosts])

  const handleEdit = () => {
    if (profileData) {
      setEditedName(profileData.name || "")
      setEditedBio(profileData.bio || "")
      setEditedInterests((profileData.interests || []).join(", "))
    }
    setEditing(true)
  }

  const save = async () => {
    if (!profileData) return
    try {
      const interests = editedInterests.split(",").map(s => s.trim()).filter(s => s)
      let avatarUrl = profileData.avatar
      if (avatarFile) {
        // Upload to Supabase storage bucket 'profile_photos'
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${profileData.id}_${Date.now()}.${fileExt}`
        const { data, error: uploadError } = await supabase.storage
          .from('profile_photos')
          .upload(fileName, avatarFile)

        if (uploadError) {
          throw new Error('Failed to upload avatar: ' + uploadError.message)
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profile_photos')
          .getPublicUrl(fileName)

        avatarUrl = publicUrl
      }
      const updatedData = {
        ...profileData,
        name: editedName,
        bio: editedBio,
        avatar: avatarUrl,
        interests,
      }

      // Save to database or local storage
      await saveProfile(updatedData)

      setProfileData(updatedData)
      setEditing(false)
      setAvatarFile(null)

      // Show success message
      alert('Profile updated successfully!')
    } catch (e) {
      console.error(e)
      alert('Error saving profile: ' + (e as Error).message)
    }
  }

  const confirm = useConfirm()

  const handleSignOut = async () => {
    try {
      const ok = await confirm({
        title: 'Sign out',
        description: 'You will be redirected to the sign-in page and will need to log in again to access your account.',
        confirmLabel: 'Sign out',
        cancelLabel: 'Cancel',
      })
      if (!ok) return

      // Confirmed in UI, skip any extra confirm inside auth provider
      await signOut(true)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (isLoading || !profileData) {
    return (
      <div className="md:flex">
        <Sidebar />
        <main className="min-h-dvh flex flex-col flex-1">
          <TopBar />
          <div className="min-h-screen bg-white">
            <div className="h-32 bg-gradient-to-b from-[#B8F1B0] to-white"></div>
            <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-20 relative z-10">
              <AnimatedLoadingSkeleton />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="md:flex">
      <Sidebar />
      <main className="min-h-dvh flex flex-col flex-1">
        <TopBar />
        <ProfileHeader profileData={profileData} postsCount={myPosts.length} editing={editing} onAvatarClick={() => fileInputRef.current?.click()} />
        <section className="mx-auto w-full max-w-2xl px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Coins: <span className="font-medium text-foreground">{profileData.coins || 0}</span>
            </div>
            {!editing ? (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleEdit}>
                  Edit profile
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={save}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="grid gap-2 mb-4">
              <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} placeholder="Name" />
              <Input value={editedBio} onChange={(e) => setEditedBio(e.target.value)} placeholder="Bio" />
              <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setAvatarFile(file)
                }
              }} style={{display: 'none'}} />
              <Input value={editedInterests} onChange={(e) => setEditedInterests(e.target.value)} placeholder="Interests (comma separated)" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-4">{profileData.bio}</p>
          )}



          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="posts">Posts ({myPosts.length})</TabsTrigger>
              <TabsTrigger value="grievances">Grievances</TabsTrigger>
              <TabsTrigger value="replies">Replies</TabsTrigger>
              <TabsTrigger value="comments">Comments ({myComments.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4">
              {myPosts.length ? (
                myPosts.map((p) => (
                  <SamplePost key={p.id} post={p} onClick={() => setSelectedPost(p)} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No posts yet.</p>
              )}
            </TabsContent>
            <TabsContent value="grievances" className="space-y-4">
              <p className="text-sm text-muted-foreground">Coming soon.</p>
            </TabsContent>
            <TabsContent value="replies">
              <p className="text-sm text-muted-foreground">No replies yet.</p>
            </TabsContent>
            <TabsContent value="comments" className="space-y-3">
              {myComments.length ? (
                myComments.map((c, i) => <CommentCard key={i} postId={c.postId} title={c.title} text={c.text} />)
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              )}
            </TabsContent>
          </Tabs>
        
        {/* Post detail dialog */}
        <Dialog open={!!selectedPost} onOpenChange={(open) => { if (!open) setSelectedPost(null) }}>
          <DialogContent>
            {selectedPost && (
              <div>
                <DialogHeader>
                  <DialogTitle>{selectedPost.title}</DialogTitle>
                  <DialogDescription className="mb-2">By {selectedPost.authorName}</DialogDescription>
                </DialogHeader>

                {selectedPost.images && selectedPost.images.length > 0 && (
                  <div className="mb-4">
                    <img src={selectedPost.images[0].src} alt={selectedPost.images[0].alt} className="w-full rounded-md object-cover" />
                  </div>
                )}

                <div className="text-sm mb-4">{selectedPost.body}</div>

                <div className="space-y-2">
                  <h3 className="font-medium">Comments</h3>
                  {(selectedPost.comments || []).length ? (
                    (selectedPost.comments || []).map((c: any) => (
                      <div key={c.id} className="text-sm border rounded p-2">
                        <div className="text-xs text-muted-foreground">{c.user}</div>
                        <div>{c.text}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No comments yet.</div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        </section>

        <BottomNav />
      </main>
    </div>
  )
}
