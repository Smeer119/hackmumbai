"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { MapPin, Heart, Share2, MessageCircle } from "lucide-react"
import { PriorityBadge } from "@/components/priority-badge"
import { CommentDialog } from "@/components/comment-dialog"
import type { Post } from "@/lib/local-db"

interface PostInteraction {
  likes: number
  comments: number
  shares: number
  isLiked: boolean
}

export function PostCard({
  post,
  initialInteraction,
}: {
  post: Post
  initialInteraction?: PostInteraction
}) {
  const [interaction, setInteraction] = useState<PostInteraction>(
    initialInteraction || {
      likes: post.likes || 0,
      comments: post.comments?.length || 0,
      shares: post.shares || 0,
      isLiked: false,
    }
  )
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [showCopiedPopup, setShowCopiedPopup] = useState(false)

  // Load interaction data from localStorage on mount
  useEffect(() => {
    const savedInteraction = localStorage.getItem(`post_${post.id}_interaction`)
    const savedComments = localStorage.getItem(`post_${post.id}_comments`)
    
    if (savedInteraction) {
      const parsedInteraction = JSON.parse(savedInteraction)
      // Update comment count from localStorage if available
      if (savedComments) {
        const comments = JSON.parse(savedComments)
        parsedInteraction.comments = comments.length
      }
      setInteraction(parsedInteraction)
    } else if (savedComments) {
      // If no interaction data but comments exist, update comment count
      const comments = JSON.parse(savedComments)
      setInteraction(prev => ({
        ...prev,
        comments: comments.length
      }))
    }
  }, [post.id])

  // Save interaction data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`post_${post.id}_interaction`, JSON.stringify(interaction))
  }, [interaction, post.id])

  const handleLike = () => {
    setInteraction(prev => ({
      ...prev,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
      isLiked: !prev.isLiked
    }))
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`)
      setInteraction(prev => ({
        ...prev,
        shares: prev.shares + 1
      }))
      setShowCopiedPopup(true)
      setTimeout(() => setShowCopiedPopup(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  const handleComment = () => {
    setIsCommentDialogOpen(true)
  }

  const handleCommentAdded = (comment: any) => {
    // Update comment count when a new comment is added
    setInteraction(prev => ({
      ...prev,
      comments: prev.comments + 1
    }))
  }
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src="/diverse-avatars.png" alt={`${post.authorName} avatar`} />
            <AvatarFallback>{post.authorName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium leading-none">{post.authorName}</p>
              <span className="text-muted-foreground text-sm">
                {post.authorHandle} · {Math.max(1, Math.round((Date.now() - post.createdAt) / 60000))}m
              </span>
            </div>
            <p className="mt-2">{post.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {post.priority ? <PriorityBadge level={post.priority} /> : null}
              {post.status ? (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                  {post.status === "in_progress"
                    ? "In progress"
                    : post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </span>
              ) : null}
              {post.location ? (
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-4" aria-hidden="true" />
                  {post.location}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{post.body}</p>

        {post.images && post.images.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <div className="flex gap-2 w-max">
              {post.images.slice(0, 3).map((img, i) => (
                <div key={i} className="relative h-48 w-72 overflow-hidden rounded-lg border flex-shrink-0">
                  <Image
                    src={img.src || "/placeholder.svg?height=300&width=400&query=post-image"}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 768px) 85vw, 400px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {post.video?.src ? (
          <div className="mt-3">
            <video src={post.video.src} controls className="w-full rounded-lg border" />
          </div>
        ) : null}

        <Separator className="my-4" />

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            className={`inline-flex items-center gap-1 transition-colors ${
              interaction.isLiked 
                ? "text-red-500 hover:text-red-600" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={handleLike}
            aria-label="Like post"
          >
            <Heart className={`size-4 ${interaction.isLiked ? "fill-current" : ""}`} aria-hidden="true" />
            {interaction.likes}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            onClick={handleComment}
            aria-label="Add comment"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            {interaction.comments}
          </button>
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              onClick={handleShare}
              aria-label="Share post"
            >
              <Share2 className="size-4" aria-hidden="true" />
              {interaction.shares}
            </button>
            {showCopiedPopup && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                Link is copied
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
              </div>
            )}
          </div>
        </div>

        {post.status === "rejected" && post.adminNote ? (
          <p className="mt-2 rounded-md border bg-secondary/30 p-2 text-xs text-destructive">
            Rejected: {post.adminNote}
          </p>
        ) : null}
      </CardContent>

      <CommentDialog
        postId={post.id}
        postTitle={post.title}
        open={isCommentDialogOpen}
        onOpenChange={setIsCommentDialogOpen}
        onCommentAdded={handleCommentAdded}
      />
    </Card>
  )
}
