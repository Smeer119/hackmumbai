import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Initialize Supabase client
type CountResult = { count: number } | null
type ErrorType = { message: string }

export const supabase = createClientComponentClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
})

// Test the connection
const testConnection = async () => {
  try {
    const { count } = await supabase
      .from('issues')
      .select('*', { count: 'exact', head: true })
    
    console.log(`✅ [SUPABASE] Connected. Total issues in database: ${count || 0}`)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ [SUPABASE] Connection error:', errorMessage)
  }
}

testConnection()
