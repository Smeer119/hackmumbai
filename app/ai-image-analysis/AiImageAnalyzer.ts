import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function AiImageAnalyzer(imageFile: File): Promise<{
  title: string
  description: string
  category: string
  location_text: string
  priority: string
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Convert image to base64
    const imageData = await fileToBase64(imageFile)

    const prompt = `
Analyze this image of a potential city issue. Extract the following information:

1. Title: A short, concise heading summarizing the issue (max 10 words)
2. Description: A 1-2 sentence explanation of the issue
3. Category: One of the following: pothole, garbage, road damage, streetlight, water issue, sanitation, utilities, or other
4. Location Text: Any visible location information (street names, landmarks, etc.) or "Not visible" if none
5. Priority: Suggest High, Medium, or Low based on severity and potential impact

If you're unsure about any field, ask the user conversationally in the response.

Respond in JSON format with keys: title, description, category, location_text, priority
`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: imageData,
        },
      },
    ])

    const response = await result.response
    const text = response.text()

    // Parse JSON response
    const parsed = JSON.parse(text.trim())

    return {
      title: parsed.title || "Issue detected",
      description: parsed.description || "An issue has been identified in the image.",
      category: parsed.category || "other",
      location_text: parsed.location_text || "",
      priority: parsed.priority || "Medium",
    }
  } catch (error) {
    console.error("AI Analysis error:", error)
    throw new Error("Failed to analyze image")
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // Remove the data:image/jpeg;base64, prefix
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
  })
}
