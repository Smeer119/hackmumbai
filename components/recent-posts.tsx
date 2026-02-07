"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Post } from "@/lib/local-db"
import AnimatedLoadingSkeleton from "@/components/ui/loading-skeleton"

interface RecentPostsProps {
  posts: Post[]
  isLoading?: boolean
}

export function RecentPosts({ posts, isLoading }: RecentPostsProps) {
  const recentPosts = posts.slice(0, 2)

  if (isLoading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-50 animate-pulse">
                <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-full bg-gray-200 rounded mb-1"></div>
                <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Posts</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {recentPosts.map((post) => (
            <div key={post.id} className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex gap-3">
                {/* Small image */}
                {post.images && post.images.length > 0 && (
                  <div className="flex-shrink-0">
                    <img 
                      src={post.images[0].src} 
                      alt={post.images[0].alt} 
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </div>
                )}
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-1">
                    {post.title}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {post.body}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{post.authorName}</span>
                    <span>{post.city || post.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {recentPosts.length === 0 && (
            <div className="text-center py-6 text-gray-500 text-sm">
              No recent posts available yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
