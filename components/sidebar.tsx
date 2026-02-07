"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, Search, BarChart2, User, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const items = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/aichat", label: "AI Chat", icon: MessageSquare },
  { href: "/search", label: "Search", icon: Search },
  { href: "/analytics", label: "Leaderboard", icon: BarChart2 },
  { href: "/donate", label: "Donate", icon: Heart },
  { href: "/profile", label: "Profile", icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="sticky top-0 hidden h-screen w-[300px] shrink-0 bg-white md:block">
      <div className="h-48 bg-gradient-to-b from-[#B8F1B0] to-white">
        <div className="flex flex-col items-center pt-8 pb-4 px-6 text-center">
          <div className="relative h-24 w-24 mb-3">
            <Image 
              src="/logo.png" 
              alt="CityPulse" 
              fill 
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-black mb-1">CityPulse</h1>
          <p className="text-sm font-medium text-gray-800 mb-2">For the citizens, by the citizens</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="px-4 py-6">
          <ul className="space-y-2">
            {items.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all mx-2",
                      isActive 
                        ? "bg-gradient-to-r from-green-50 to-green-50/80 text-green-700 shadow-sm border border-green-100" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className={cn(
                      "p-2 rounded-lg transition-all",
                      isActive 
                        ? "bg-green-100 text-green-600" 
                        : "bg-gray-50 text-gray-500 group-hover:bg-green-50 group-hover:text-green-600"
                    )}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-green-500"></span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <Link 
            href="/homechat"
            className="block transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center gap-3 rounded-xl bg-green-50 p-3 cursor-pointer hover:bg-green-100 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Need help?</p>
                <p className="text-xs text-gray-500">Chat with our support</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  )
}
