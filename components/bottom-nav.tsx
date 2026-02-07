"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { Home, MessageSquare, Search, BarChart2, Heart } from "lucide-react"

type Item = { 
  href: string 
  label: string 
  icon: LucideIcon 
  activeIcon?: LucideIcon
}

const navItems: Item[] = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/analytics", label: "Leaderboard", icon: BarChart2 },
  { href: "/aichat", label: "AI Chat", icon: MessageSquare },
  { href: "/donate", label: "Donate", icon: Heart },
]

export function BottomNav() {
  const pathname = usePathname()
  const isHome = pathname === '/home' || pathname === '/'
  
  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4 sm:hidden">
      <nav className="relative mx-auto max-w-md">
        <div className="relative rounded-2xl bg-white/95 px-4 shadow-xl shadow-black/5 backdrop-blur-lg border border-gray-100">
          <ul className="relative flex items-center justify-between flex-nowrap">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <li key={item.href} className="flex-1 min-w-0">
                  <Link
                    href={item.href}
                    className={cn(
                      "group relative flex flex-col items-center py-3 px-1 text-xs font-medium transition-all",
                      isActive ? "text-green-600" : "text-gray-500 hover:text-green-600"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <div className={cn(
                      "mb-1.5 rounded-xl p-2 transition-all",
                      isActive 
                        ? "bg-green-100/80 text-green-600" 
                        : "text-gray-400 group-hover:bg-green-50 group-hover:text-green-500"
                    )}>
                      <Icon className={cn("h-5 w-5 transition-transform", isActive ? "scale-110" : "group-hover:scale-105")} />
                    </div>
                    <span className={cn("text-[10px] font-medium transition-all whitespace-nowrap truncate", isActive ? "text-green-600" : "text-gray-500")}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
    </div>
  )
}
