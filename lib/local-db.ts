import { supabase } from "./supabase"

export type Priority = "High" | "Medium" | "Low"
export type Status = "pending" | "in_progress" | "solved" | "rejected"

export type Comment = {
  id: string
  user: string
  text: string
  ts: number
}

export interface Post {
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
  video: { src: string; type?: string } | null
  likes: number
  dislikes: number
  comments: any[]
  shares: number
  status: string
  adminNote: string
  createdAt: number
  created_at?: string
}

export interface NewIssueData {
  title: string
  description: string
  category?: string
  location_text?: string
  priority?: string
  photos?: string[]
  status: string
  reporter_name: string
  created_at?: string
}

export interface ProfileData {
  id: string
  name: string
  handle: string
  email: string
  avatar?: string
  bio?: string
  interests?: string[]
  profession?: string
  posts_count?: number
  coins?: number
}

export type User = ProfileData

const KEYS = {
  user: "civic.auth.user",
  posts: "civic.posts",
}

export const DEMO_USER: User = {
  id: "demo",
  name: "Demo User",
  handle: "@demo",
  email: "demo@civic.app",
  avatar: "/placeholder-user.jpg",
  coins: 0,
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

export function getCurrentUser(): User | null {
  const u = read<User | null>(KEYS.user, null)
  return u ? { coins: 0, ...u } : null
}

export function demoSignIn(email: string, password: string) {
  const ok = email === DEMO_USER.email && password === "civic123"
  if (ok) {
    const u = read<User | null>(KEYS.user, null)
    write(KEYS.user, u ? { coins: u.coins ?? 0, ...u } : DEMO_USER)
  }
  return ok
}

export function signOut() {
  if (typeof window === "undefined") return
  localStorage.removeItem(KEYS.user)
}

export function seedPostsIfEmpty() {
  const existing = read<Post[]>(KEYS.posts, [])
  if (existing.length) return
  const now = Date.now()
  const seeded: Post[] = [
    {
      id: "1",
      title: "Potholes in front of Fresco Hotel. Need urgent fixing.",
      body: "The road is completely damaged and vehicles are struggling to pass through. This needs to be fixed soon.",
      authorName: "Anidhya Sharma",
      authorHandle: "@anidhya",
      location: "Sattva Greenage, Salarpuria",
      city: "Bengaluru",
      year: new Date(now).getFullYear(),
      category: "roads",
      priority: "High",
      images: [
        { src: "/pothole.png", alt: "Pothole on road" },
        { src: "/issue.jpg", alt: "Broken pavement" },
      ],
      video: null,
      likes: 634,
      dislikes: 42,
      comments: [
        { id: "c1", user: "Rahul", text: "This is getting worse daily.", ts: now - 1000 * 60 * 40 },
        { id: "c2", user: "Meera", text: "Tagging local ward office.", ts: now - 1000 * 60 * 28 },
      ],
      shares: 21,
      status: "in_progress",
      adminNote: "",
      createdAt: now - 1000 * 60 * 23,
    },
    {
      id: "2",
      title: "Street lights out on Maple Ave",
      body: "Blocks B–D have lights out since yesterday. Please take caution at night.",
      authorName: "Civic Watch",
      authorHandle: "@civicwatch",
      location: "Maple Ave, Block C",
      city: "Pune",
      year: new Date(now).getFullYear(),
      category: "utilities",
      priority: "Medium",
      images: [{ src: "/water-issue.jpg", alt: "Utility outage" }],
      video: null,
      likes: 129,
      dislikes: 3,
      comments: [{ id: "c3", user: "Lata", text: "Reported to BESCOM.", ts: now - 1000 * 60 * 9 }],
      shares: 6,
      status: "pending",
      adminNote: "",
      createdAt: now - 1000 * 60 * 12,
    },
    {
      id: "3",
      title: "Unauthorized dumping behind Block A",
      body: "Garbage pile-up; attracts stray animals.",
      authorName: "Demo User",
      authorHandle: "@demo",
      city: "Delhi",
      year: new Date(now).getFullYear() - 1,
      category: "sanitation",
      priority: "Low",
      images: [],
      video: null,
      likes: 40,
      dislikes: 1,
      comments: [],
      shares: 2,
      status: "rejected",
      adminNote: "Insufficient location details. Please add a landmark.",
      createdAt: now - 1000 * 60 * 60 * 24 * 130,
    },
    {
      id: "4",
      title: "Crosswalk repaint required at Main Square",
      body: "Faded lines cause confusion.",
      authorName: "Demo User",
      authorHandle: "@demo",
      city: "Bengaluru",
      year: new Date(now).getFullYear(),
      category: "roads",
      priority: "Low",
      images: [],
      video: null,
      likes: 12,
      dislikes: 0,
      comments: [],
      shares: 1,
      status: "solved",
      adminNote: "",
      createdAt: now - 1000 * 60 * 60 * 24 * 20,
    },
  ]
  write(KEYS.posts, seeded)
}

function normalizePost(p: any): Post {
  return {
    id: String(p?.id ?? crypto.randomUUID()),
    title: String(p?.title ?? ""),
    body: String(p?.body ?? ""),
    authorName: String(p?.authorName ?? "Unknown"),
    authorHandle: String(p?.authorHandle ?? "@unknown"),
    location: p?.location ?? "",
    city: p?.city ?? "",
    year: typeof p?.year === "number" ? p.year : new Date().getFullYear(),
    category: p?.category ?? "",
    priority: (p?.priority as any) ?? "Low",
    images: Array.isArray(p?.images) ? p.images.slice(0, 3) : [],
    video:
      p?.video && typeof p.video?.src === "string"
        ? { src: String(p.video.src), type: String(p.video.type ?? "") }
        : null,
    likes: Number.isFinite(p?.likes) ? Number(p.likes) : 0,
    dislikes: Number.isFinite(p?.dislikes) ? Number(p.dislikes) : 0,
    // IMPORTANT: ensure comments is always an array
    comments: Array.isArray(p?.comments) ? p.comments : [],
    shares: Number.isFinite(p?.shares) ? Number(p.shares) : 0,
    status: p?.status ?? "pending",
    adminNote: String(p?.adminNote ?? ""),
    createdAt: Number.isFinite(p?.createdAt) ? Number(p.createdAt) : Date.now(),
  }
}

function normalizePosts(posts: any[]): Post[] {
  return (Array.isArray(posts) ? posts : []).map(normalizePost)
}

export function getPosts(): Post[] {
  seedPostsIfEmpty()
  const raw = read<any[]>(KEYS.posts, [])
  return normalizePosts(raw)
}

export function savePosts(posts: Post[]) {
  write(KEYS.posts, posts)
}

export function getPost(id: string) {
  return getPosts().find((p) => p.id === id) || null
}

export function upsertPost(post: Post) {
  const posts = getPosts()
  const idx = posts.findIndex((p) => p.id === post.id)
  if (idx >= 0) posts[idx] = post
  else posts.unshift(post)
  savePosts(posts)
}

export function deletePost(id: string) {
  const posts = getPosts().filter((p) => p.id !== id)
  savePosts(posts)
}

export function likePost(id: string) {
  const posts = getPosts().map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
  savePosts(posts)
}

export function dislikePost(id: string) {
  const posts = getPosts().map((p) => (p.id === id ? { ...p, dislikes: (p.dislikes ?? 0) + 1 } : p))
  savePosts(posts)
}

export function commentOnPost(id: string, user: string, text: string) {
  const posts = getPosts().map((p) =>
    p.id === id
      ? {
          ...p,
          comments: [
            ...(Array.isArray(p.comments) ? p.comments : []),
            { id: crypto.randomUUID(), user, text, ts: Date.now() },
          ],
        }
      : p,
  )
  savePosts(posts)
}

export function sharePost(id: string) {
  const posts = getPosts().map((p) => (p.id === id ? { ...p, shares: p.shares + 1 } : p))
  savePosts(posts)
}

export function addCoins(amount: number) {
  const u = getCurrentUser()
  if (!u) return
  const updated = { ...u, coins: (u.coins ?? 0) + amount }
  write(KEYS.user, updated)
}

export function updateUser(updates: Partial<User>) {
  const u = getCurrentUser()
  if (!u) return
  write(KEYS.user, { ...u, ...updates })
}

export function newPostTemplate(author: User): Post {
  return {
    id: crypto.randomUUID(),
    title: "",
    body: "",
    authorName: author.name,
    authorHandle: author.handle,
    location: "",
    city: "Bengaluru",
    year: new Date().getFullYear(),
    category: "",
    priority: "Low",
    images: [],
    video: null,
    likes: 0,
    dislikes: 0,
    comments: [],
    shares: 0,
    status: "pending",
    adminNote: "",
    createdAt: Date.now(),
  }
}

export function setPostStatus(id: string, status: Status, note?: string) {
  const posts = getPosts().map((p) =>
    p.id === id ? { ...p, status, adminNote: status === "rejected" ? note || p.adminNote : "" } : p,
  )
  savePosts(posts)
}

export async function getPostsFromDB(): Promise<Post[]> {
  const { data, error } = await supabase.from('posts').select('data')
  if (error) {
    console.error(error)
    return []
  }
  return data.map((d: any) => d.data)
}

export async function savePostsToDB(posts: Post[]) {
  for (const post of posts) {
    const { error } = await supabase.from('posts').upsert({ id: post.id, data: post })
    if (error) console.error(error)
  }
}

export async function getProfileFromDB(userId: string): Promise<ProfileData | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile from DB:', error)
    return null
  }

  // Map avatar_url from DB to avatar in ProfileData
  return {
    id: data.id,
    name: data.name,
    handle: data.handle,
    email: data.email,
    avatar: data.avatar_url, // Map avatar_url to avatar
    bio: data.bio,
    interests: data.interests,
    profession: data.profession,
    posts_count: data.posts_count,
    coins: data.coins,
  } as ProfileData
}

export async function saveProfile(profile: ProfileData): Promise<void> {
  if (profile.id === 'guest') {
    // Save guest profile to local storage
    write('guest.profile', profile)
  } else {
    // Save to Supabase, including avatar
    const { avatar, bio, interests, ...profileWithoutAvatar } = profile
    const { error } = await supabase
      .from('profiles')
      .upsert({
        ...profileWithoutAvatar,
        avatar_url: avatar, // Store avatar URL in avatar_url column
      })

    if (error) {
      console.error('Error saving profile:', error)
      throw error
    }
  }
}
