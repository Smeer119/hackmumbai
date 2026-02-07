"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

type Priority = 'High' | 'Medium' | 'Low'

export function PostForm() {
  const { toast } = useToast()
  const router = useRouter()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [priority, setPriority] = useState<Priority>('Medium')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)
  const [isAnonymous, setIsAnonymous] = useState(false)

  // Get current user on component mount
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      // If no user, force anonymous mode
      if (!user) {
        setIsAnonymous(true)
      }
    }
    getUser()
  }, [])

  async function uploadFile(file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `issue-photos/${fileName}`

      const { error } = await supabase.storage
        .from('issue-photos')
        .upload(filePath, file)

      if (error) {
        console.error('Storage upload error:', error)
        throw new Error(`Failed to upload file: ${error.message}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('issue-photos')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error in uploadFile:', error)
      throw error
    }
  }

  async function onPickImages(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const selected = Array.from(e.target.files).slice(0, 3 - selectedFiles.length)
    setSelectedFiles(prev => [...prev, ...selected].slice(0, 3))
    
    // Create preview URLs
    const previews = await Promise.all(
      selected.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
      })
    )
    setImagePreviews(prev => [...prev, ...previews].slice(0, 3))
  }

  function removeImage(index: number) {
    const newFiles = [...selectedFiles]
    const newPreviews = [...imagePreviews]
    newFiles.splice(index, 1)
    newPreviews.splice(index, 1)
    setSelectedFiles(newFiles)
    setImagePreviews(newPreviews)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validation
    if (!title.trim() || !description.trim() || !location.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)

    try {
      // Upload images if any
      let uploadedImages: string | null = null
      if (selectedFiles.length > 0) {
        try {
          const images = await Promise.all(
            selectedFiles.map(file => uploadFile(file))
          )
          uploadedImages = images.join(',') // Convert array to comma-separated string
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError)
          toast({
            title: "Warning",
            description: "Issue submitted but image upload failed. You can add images later.",
            variant: "default",
          })
        }
      }

      // Prepare data according to your schema
      const insertData: any = {
        title: title.trim(),
        description: description.trim(),
        category: category || 'Other',
        location_text: location.trim(),
        priority: priority.toLowerCase(),
        photos: uploadedImages,
        status: 'open',
        reporter_name: isAnonymous || !user ? 'Anonymous' : (user.user_metadata?.full_name || user.email || 'User'),
        created_at: new Date().toISOString(),
      }

      // Only include reporter_id if user is logged in AND not anonymous
      if (user && !isAnonymous) {
        insertData.reporter_id = user.id
      }
      // If anonymous or no user, reporter_id will be omitted (null in database)

      console.log('Insert data:', insertData)

      // Save to Supabase
      const { data, error } = await supabase
        .from('issues')
        .insert([insertData])
        .select()

      if (error) {
        console.error('Supabase insert error details:', error)
        throw new Error(error.message || `Database error: ${error.code}`)
      }

      console.log('Insert successful:', data)

      toast({
        title: "Success!",
        description: "Your issue has been reported successfully.",
      })
      
      // Reset form
      setTitle('')
      setDescription('')
      setCategory('')
      setLocation('')
      setPriority('Medium')
      setSelectedFiles([])
      setImagePreviews([])
      if (user) {
        setIsAnonymous(false)
      }
      
      // Redirect to home page
      router.push('/home')
      router.refresh()
    } catch (error) {
      console.error('Error submitting post:', error)
      
      let errorMessage = "Failed to submit the issue. Please try again."
      if (error instanceof Error) {
        if (error.message.includes('reporter_id') || error.message.includes('foreign key')) {
          errorMessage = "Database configuration issue. Please contact support."
        } else if (error.message.includes('JWT')) {
          errorMessage = "Authentication error. Please refresh the page and try again."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Report an Issue</h2>
      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Anonymous toggle at the top */}
        {user && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="anonymous" className="text-sm font-medium">
                Post Anonymously
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Your name will not be shown with this post.
              </p>
            </div>
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
              disabled={isSubmitting}
            />
          </div>
        )}

        {!user && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              🔒 You are posting as <strong>Anonymous</strong>. 
              {` `}
              <button 
                type="button" 
                onClick={() => router.push('/auth/login')}
                className="text-primary underline hover:no-underline"
              >
                Log in
              </button>
              {` `}to post with your name.
            </p>
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="title">Title *</Label>
          <Input 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            placeholder="Enter issue title"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea 
            id="description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            rows={5} 
            required 
            placeholder="Describe the issue in detail"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Road">🚧 Road</SelectItem>
              <SelectItem value="Water">💧 Water</SelectItem>
              <SelectItem value="Electricity">⚡ Electricity</SelectItem>
              <SelectItem value="Waste">🗑️ Waste</SelectItem>
              <SelectItem value="Other">❓ Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="location">Location *</Label>
          <Input 
            id="location" 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
            required
            placeholder="Where is this issue located?"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={(value: Priority) => setPriority(value)} disabled={isSubmitting}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High">🔴 High</SelectItem>
              <SelectItem value="Medium">🟡 Medium</SelectItem>
              <SelectItem value="Low">🟢 Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Images (max 3)</Label>
          <Input 
            type="file" 
            accept="image/*" 
            multiple 
            onChange={onPickImages} 
            disabled={selectedFiles.length >= 3 || isSubmitting}
            aria-label="Upload images"
            className="cursor-pointer"
          />
          {imagePreviews.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-2">
              {imagePreviews.map((preview, i) => (
                <div key={i} className="relative h-24 w-24 flex-shrink-0">
                  <img
                    src={preview}
                    alt={`Preview ${i + 1}`}
                    className="h-full w-full rounded object-cover border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    disabled={isSubmitting}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Report Issue"}
        </Button>
        
        <p className="text-xs text-muted-foreground">
          * Required fields. Your report will be {isAnonymous || !user ? 'anonymous' : 'linked to your account'}.
        </p>
      </form>
    </div>
  )
}