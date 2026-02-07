import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Fetch all data from issues table
    const { data: issues, error } = await supabase
      .from("issues")
      .select("*")

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch data from database" }, { status: 500 })
    }

    if (!issues || issues.length === 0) {
      return NextResponse.json({ response: "No issues found in the database." })
    }

    // Process the data
    const today = new Date().toISOString().split('T')[0]
    const todayIssues = issues.filter(issue => issue.created_at && issue.created_at.startsWith(today))

    const categoryCounts = issues.reduce((acc, issue) => {
      const category = issue.category || 'Uncategorized'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const todayCategoryCounts = todayIssues.reduce((acc, issue) => {
      const category = issue.category || 'Uncategorized'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Classify query type
    const isDatabaseQuery = /\b(issue|report|pothole|street|water|electricity|garbage|traffic|lighting|damage|broken|repair|fix|problem|complaint|category|count|total|today|week|month)\b/i.test(query)

    // Check if Gemini API key is available
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      // Fallback response without AI
      if (isDatabaseQuery) {
        let response = `Based on our database:\n\nTotal issues: ${issues.length}\nToday's issues: ${todayIssues.length}\n\nCategory breakdown:\n`
        Object.entries(categoryCounts).forEach(([category, count]) => {
          response += `${category}: ${count}\n`
        })
        response += `\nToday's category breakdown:\n`
        Object.entries(todayCategoryCounts).forEach(([category, count]) => {
          response += `${category}: ${count}\n`
        })
        return NextResponse.json({ response })
      } else {
        return NextResponse.json({ response: "I'm here to help with city-related issues and information. You can ask me about reported problems, city services, or how to report an issue. For general questions, I recommend checking official city resources or contacting local authorities directly." })
      }
    }

    // Use Gemini API to generate response
    const prompt = isDatabaseQuery
      ? `User query: "${query}"\n\nDatabase data summary:\n- Total issues in database: ${issues.length}\n- Issues reported today: ${todayIssues.length}\n- Category breakdown: ${JSON.stringify(categoryCounts)}\n- Today's category breakdown: ${JSON.stringify(todayCategoryCounts)}\n\nPlease provide a helpful, accurate response based on this data. Answer questions about issue counts, categories, and trends. If the query doesn't match the data, say so politely.`
      : `User query: "${query}"\n\nYou are CityZen, an intelligent city assistant. The user is asking a general question. Provide a helpful, friendly response. If it's about city services, reporting issues, or general information, offer assistance. For non-city related topics, politely redirect to city-related help or suggest appropriate resources. Be conversational and supportive.`

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    if (!geminiResponse.ok) {
      console.error("Gemini API error:", geminiResponse.status, geminiResponse.statusText)
      // Fallback to basic response
      let response = `Based on our database:\n\nTotal issues: ${issues.length}\nToday's issues: ${todayIssues.length}\n\nCategory breakdown:\n`
      Object.entries(categoryCounts).forEach(([category, count]) => {
        response += `${category}: ${count}\n`
      })
      return NextResponse.json({ response })
    }

    const geminiData = await geminiResponse.json()
    console.log("Gemini response:", geminiData)

    const response = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
                    geminiData.error?.message ||
                    "Sorry, I couldn't generate a response. Please try again."

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
