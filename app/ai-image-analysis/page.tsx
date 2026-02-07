"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AiImageAnalyzer } from "./AiImageAnalyzer"
import { motion } from "framer-motion"

type AnalysisResult = {
  title: string
  description: string
  category: string
  location_text: string
  priority: string
}

export default function AiImageAnalysisPage() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [conversationalMessages, setConversationalMessages] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)

      // Request location when image is selected (especially for camera capture)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
            console.log('Location obtained:', position.coords.latitude, position.coords.longitude)
          },
          (error) => {
            console.error('Geolocation error:', error)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        )
      }
    }
  }

  const handleImageClick = () => {
    document.getElementById('image-upload')?.click()
  }

  const handleAnalyze = async () => {
    if (!imageFile) return
    setIsAnalyzing(true)
    setConversationalMessages([])
    try {
      const result = await AiImageAnalyzer(imageFile)
      setAnalysis(result)

      // Check for conversational prompts
      if (result.title.includes("ask") || result.description.includes("ask")) {
        setConversationalMessages(prev => [...prev, "I need more information about this issue. Can you provide additional details?"])
      }
    } catch (error) {
      console.error("Analysis failed:", error)
      setConversationalMessages(["Sorry, I couldn't analyze this image. Please try again or provide more details."])
    } finally {
      setIsAnalyzing(false)
    }
  }

  const updateAnalysis = (key: keyof AnalysisResult, value: string) => {
    if (analysis) {
      setAnalysis({ ...analysis, [key]: value })
    }
  }

  return (
    <main className="min-h-dvh flex flex-col bg-gray-50 font-inter">
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">CityPulse AI Image Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <Label htmlFor="image-upload">Upload or Capture Image</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelect}
                  className="cursor-pointer hidden"
                />
                <div
                  onClick={handleImageClick}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  {imagePreview ? (
                    <motion.img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg mx-auto"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  ) : (
                    <div className="text-gray-500">
                      <p className="text-lg mb-2">📷 Click to upload or capture an image</p>
                      <p className="text-sm">Supported formats: JPG, PNG, WebP</p>
                    </div>
                  )}
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button onClick={handleAnalyze} disabled={!imageFile || isAnalyzing} className="w-full">
                  {isAnalyzing ? "Analyzing..." : "Analyze Image"}
                </Button>
              </motion.div>

              {conversationalMessages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-blue-50 p-4 rounded-lg"
                >
                  <h4 className="font-semibold mb-2">AI Assistant:</h4>
                  {conversationalMessages.map((msg, i) => (
                    <p key={i} className="text-sm text-blue-800 mb-2">{msg}</p>
                  ))}
                </motion.div>
              )}

              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold">Analysis Results</h3>
                  <div className="grid gap-4">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={analysis.title}
                        onChange={(e) => updateAnalysis("title", e.target.value)}
                      />
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={analysis.description}
                        onChange={(e) => updateAnalysis("description", e.target.value)}
                        rows={3}
                      />
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={analysis.category}
                        onChange={(e) => updateAnalysis("category", e.target.value)}
                      />
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Label htmlFor="location">Location Text</Label>
                      <Input
                        id="location"
                        value={analysis.location_text}
                        onChange={(e) => updateAnalysis("location_text", e.target.value)}
                      />
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Label>Priority</Label>
                      <Select value={analysis.priority} onValueChange={(v) => updateAnalysis("priority", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Button className="w-full mt-4" disabled>
                      Finish (Save to DB - Not Implemented Yet)
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
