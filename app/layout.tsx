import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import ConfirmProvider from "@/components/confirm-provider"

export const metadata: Metadata = {
  title: "City Pulse",
  description: "Created with v0",
  generator: "v0.app",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Permissions-Policy" content="camera=(self), geolocation=(self)" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ConfirmProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              {children}
            </Suspense>
            <Analytics />
          </AuthProvider>
        </ConfirmProvider>
      </body>
    </html>
  )
}
