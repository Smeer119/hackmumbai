"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Users, Gift, Target, Sparkles, HandHeart } from "lucide-react"
import Image from "next/image"

export default function DonatePage() {
  const [donationAmount, setDonationAmount] = useState("")
  const [selectedAmount, setSelectedAmount] = useState("")

  const presetAmounts = ["10", "25", "50", "100", "250", "500"]

  const handlePresetAmount = (amount: string) => {
    setSelectedAmount(amount)
    setDonationAmount(amount)
  }

  const handleDonate = () => {
    // Handle donation logic here
    alert(`Thank you for your donation of $${donationAmount || selectedAmount}!`)
  }

  return (
    <div className="md:flex">
      <Sidebar />
      <main className="min-h-dvh flex flex-col flex-1">
        <TopBar />
        <div className="min-h-screen bg-white">
          <div className="h-32 bg-gradient-to-b from-[#B8F1B0] to-white"></div>
          <div className="mx-auto w-full max-w-6xl px-4 md:px-8 -mt-20 relative z-10">
            
            {/* Hero Section with Scanner Image */}
            <div className="text-center mb-12">
         
              
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  <span className="flex items-center justify-center gap-3">
                    <Heart className="text-red-500" size={40} />
                    Make a Difference Today
                    <Heart className="text-red-500" size={40} />
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  Your generous donations help us support <span className="font-semibold text-green-600">poor children</span>, 
                  empower <span className="font-semibold text-blue-600">NGOs</span>, and bring hope to countless lives. 
                  Every contribution creates a ripple of positive change in our community.
                </p>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Sparkles className="text-yellow-500" size={20} />
                  <span className="text-lg font-medium">Together, we can build a better tomorrow</span>
                  <Sparkles className="text-yellow-500" size={20} />
                </div>
              </div>
            </div>
     <div className="relative mx-auto w-full max-w-2xl mb-8">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/scanner.jpeg"
                    alt="QR Code for Donations"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
              </div>
            {/* Impact Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                    <Users className="text-white" size={24} />
                  </div>
                  <CardTitle className="text-blue-900">Support Children</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-blue-800">
                    Help provide education, nutrition, and healthcare to underprivileged children in our community.
                  </p>
                </CardContent>
              </Card>
              

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-3">
                    <HandHeart className="text-white" size={24} />
                  </div>
                  <CardTitle className="text-green-900">Empower NGOs</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-green-800">
                    Support local NGOs working tirelessly to make a difference in various social causes.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-3">
                    <Target className="text-white" size={24} />
                  </div>
                  <CardTitle className="text-purple-900">Create Impact</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-purple-800">
                    Your contributions directly fund projects that bring lasting positive change to society.
                  </p>
                </CardContent>
              </Card>
            </div>

       

            {/* Additional Information */}
            <div className="mt-16 text-center pb-8">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Every Dollar Makes a Difference
                </h2>
                <p className="text-gray-700 max-w-3xl mx-auto text-lg">
                  Join our community of compassionate donors who are transforming lives. 
                  Whether it's a small contribution or a substantial gift, your support 
                  helps us continue our mission of creating positive social impact.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">500+</div>
                    <div className="text-sm text-gray-600">Children Helped</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">50+</div>
                    <div className="text-sm text-gray-600">NGOs Supported</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">$10K+</div>
                    <div className="text-sm text-gray-600">Funds Raised</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <BottomNav />
      </main>
    </div>
  )
}
