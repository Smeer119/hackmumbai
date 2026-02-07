"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AnimatedLoadingSkeleton from "@/components/ui/loading-skeleton"
import { Sidebar } from "@/components/sidebar"
import { BottomNav } from "@/components/bottom-nav"
import { TopBar } from "@/components/top-bar"
import { Home, BarChart2, MessageSquare, User } from "lucide-react"

type LeaderboardEntry = {
  id: string
  name: string
  image_url: string | null
  points: number
  city: string
  rank: number | null
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
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
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="md:flex">
        <Sidebar />
        <main className="min-h-dvh flex flex-col flex-1">
          <TopBar />
          <div className="min-h-screen bg-gradient-to-b from-[#B8F1B0] to-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
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
        <div className="min-h-screen bg-gradient-to-b from-[#B8F1B0] to-white p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">City Superheros</h1>
              <p className="text-gray-600">Our most active community members</p>
            </div>

            <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((entry) => (
                    <div 
                      key={entry.id} 
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="relative">
                        {entry.rank === 1 && (
                          <div className="absolute -top-2 -left-2 bg-amber-400 text-amber-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            👑
                          </div>
                        )}
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          {entry.image_url ? (
                            <img
                              src={entry.image_url}
                              alt={entry.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xl font-medium text-gray-500">
                              {entry.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          {entry.rank}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{entry.name}</h3>
                        <p className="text-sm text-gray-500">{entry.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{entry.points.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                    </div>
                  ))}
                  
                  {leaderboard.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No leaderboard data available yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <BottomNav />
      </main>
    </div>
  )
}