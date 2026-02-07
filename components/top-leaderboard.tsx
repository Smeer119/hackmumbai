"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Medal } from "lucide-react"

type LeaderboardEntry = {
  id: string
  name: string
  image_url: string | null
  points: number
  city: string
  rank: number | null
}

interface TopLeaderboardProps {
  entries: LeaderboardEntry[]
  isLoading?: boolean
}

export function TopLeaderboard({ entries, isLoading }: TopLeaderboardProps) {
  const topEntries = entries.slice(0, 3)

  if (isLoading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Top Contributors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-amber-500" />
      case 2:
        return <Medal className="w-4 h-4 text-gray-400" />
      case 3:
        return <Medal className="w-4 h-4 text-amber-600" />
      default:
        return <span className="text-sm font-medium text-gray-500">{rank}</span>
    }
  }

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-amber-50 border-amber-200"
      case 2:
        return "bg-gray-50 border-gray-200"
      case 3:
        return "bg-amber-50 border-amber-200"
      default:
        return "bg-white border-gray-100"
    }
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Top Contributors</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {topEntries.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm ${getRankBg(entry.rank || 0)}`}
            >
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={entry.image_url || ""} alt={entry.name} />
                  <AvatarFallback className="text-sm font-medium">
                    {entry.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                  {getRankIcon(entry.rank || 0)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 truncate">{entry.name}</h4>
                <p className="text-xs text-gray-500 truncate">{entry.city}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{entry.points.toLocaleString()}</p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>
          ))}
          
          {topEntries.length === 0 && (
            <div className="text-center py-6 text-gray-500 text-sm">
              No leaderboard data available yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
