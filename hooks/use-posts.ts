"use client"

import { useCallback, useEffect, useState } from "react"
import {
  type Post,
  getPosts,
  upsertPost as dbUpsert,
  deletePost as dbDelete,
  likePost as dbLike,
  commentOnPost as dbComment,
  sharePost as dbShare,
  dislikePost as dbDislike,
  setPostStatus as dbSetStatus,
} from "@/lib/local-db"

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    setPosts(getPosts())
    const onStorage = (e: StorageEvent) => {
      if (e.key === "civic.posts") setPosts(getPosts())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const refresh = useCallback(() => setPosts(getPosts()), [])

  const upsertPost = useCallback((post: Post) => {
    dbUpsert(post)
    setPosts(getPosts())
  }, [])

  const deletePost = useCallback((id: string) => {
    dbDelete(id)
    setPosts(getPosts())
  }, [])

  const likePost = useCallback((id: string) => {
    dbLike(id)
    setPosts(getPosts())
  }, [])

  const dislike = useCallback((id: string) => {
    dbDislike(id)
    setPosts(getPosts())
  }, [])

  const comment = useCallback((id: string, user: string, text: string) => {
    dbComment(id, user, text)
    setPosts(getPosts())
  }, [])

  const share = useCallback((id: string) => {
    dbShare(id)
    setPosts(getPosts())
  }, [])

  const setStatus = useCallback((id: string, status: any, note?: string) => {
    dbSetStatus(id, status, note)
    setPosts(getPosts())
  }, [])

  return { posts, refresh, upsertPost, deletePost, likePost, dislike, comment, share, setStatus }
}
