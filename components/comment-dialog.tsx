"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, X } from "lucide-react"

interface Comment {
  id: string
  text: string
  author: string
  timestamp: number
}

interface CommentDialogProps {
  postId: string
  postTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onCommentAdded: (comment: Comment) => void
}

export function CommentDialog({ 
  postId, 
  postTitle, 
  open, 
  onOpenChange, 
  onCommentAdded 
}: CommentDialogProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load comments from localStorage when dialog opens
  useEffect(() => {
    if (open) {
      const savedComments = localStorage.getItem(`post_${postId}_comments`)
      if (savedComments) {
        setComments(JSON.parse(savedComments))
      }
    }
  }, [open, postId])

  // Save comments to localStorage whenever comments change
  useEffect(() => {
    if (comments.length > 0) {
      localStorage.setItem(`post_${postId}_comments`, JSON.stringify(comments))
    }
  }, [comments, postId])

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    
    // Create new comment
    const comment: Comment = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: newComment.trim(),
      author: "You", // You can replace this with actual user data
      timestamp: Date.now()
    }

    // Add comment to list
    setComments(prev => [comment, ...prev])
    
    // Notify parent component
    onCommentAdded(comment)
    
    // Clear input
    setNewComment("")
    setIsSubmitting(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmitComment()
    }
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>Comments on "{postTitle}"</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt={comment.author} />
                  <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(comment.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Section */}
        <div className="flex-shrink-0 border-t pt-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Write a comment... (Ctrl+Enter to send)"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyPress}
              className="min-h-[80px] resize-none"
              disabled={isSubmitting}
            />
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              size="icon"
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Ctrl+Enter to send your comment
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
