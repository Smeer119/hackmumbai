"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"

export function TopBar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        {/* Mobile Logo */}
        <Link href="/home" className="flex items-center gap-2" aria-label="CityPulse home">
          <div className="relative h-8 w-8">
            <Image 
              src="/logo.png" 
              alt="CityPulse" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            CityPulse
          </span>
        </Link>

        {/* Profile icon */}
        <Link href="/profile" aria-label="Open profile">
          <Avatar className="size-9 border border-gray-200">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              CP
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  )
}
