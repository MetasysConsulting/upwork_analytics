'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseTest() {
  const [status, setStatus] = useState<string>('Testing...')
  const [details, setDetails] = useState<string>('')

  useEffect(() => {
    async function testConnection() {
      try {
        setStatus('Testing connection...')
        setDetails('Attempting to connect to Supabase...')
        
        // First, let's test if we can reach the Supabase URL
        console.log('Testing Supabase URL:', 'https://psegulpmbdaxhjhsfzlb.supabase.co')
        
        // Test direct fetch to see if it's a CORS issue
        try {
          const response = await fetch('https://psegulpmbdaxhjhsfzlb.supabase.co/rest/v1/scraped_jobs?select=count&limit=1', {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZWd1bHBtYmRheGhqaHNmemxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNTM5MzAsImV4cCI6MjA2ODkyOTkzMH0.XvkwT_fX3JzJ8TrRFunMN-d41XWrb_V2mnpGiCfCUis',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZWd1bHBtYmRheGhqaHNmemxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNTM5MzAsImV4cCI6MjA2ODkyOTkzMH0.XvkwT_fX3JzJ8TrRFunMN-d41XWrb_V2mnpGiCfCUis'
            }
          })
          console.log('Direct fetch response:', response.status, response.statusText)
        } catch (fetchError) {
          console.log('Direct fetch failed:', fetchError)
        }
        
        // Test basic connection with more detailed error handling
        const { data, error } = await supabase
          .from('scraped_jobs')
          .select('count')
          .limit(1)

        console.log('Raw Supabase response:', { data, error })

        if (error) {
          setStatus('Connection failed')
          setDetails(`Error: ${error.message} (Code: ${error.code})`)
          console.error('Connection test error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          })
          return
        }

        setStatus('Connection successful')
        setDetails('Successfully connected to scraped_jobs table')

        // Test actual data fetch
        const { data: jobs, error: jobsError } = await supabase
          .from('scraped_jobs')
          .select('id, title')
          .limit(5)

        if (jobsError) {
          setDetails(`Connected but data fetch failed: ${jobsError.message}`)
        } else {
          setDetails(`Connected successfully. Found ${jobs?.length || 0} jobs in table.`)
        }

      } catch (err) {
        setStatus('Connection failed')
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setDetails(`Exception: ${errorMessage}`)
        console.error('Test exception details:', {
          error: err,
          message: errorMessage,
          stack: err instanceof Error ? err.stack : undefined
        })
      }
    }

    testConnection()
  }, [])

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">Supabase Connection Test</h3>
      <p className="text-blue-800 font-medium">Status: {status}</p>
      <p className="text-blue-700 text-sm mt-1">{details}</p>
      <div className="mt-2 text-xs text-blue-600">
        <p>URL: https://psegulpmbdaxhjhsfzlb.supabase.co</p>
        <p>Key: [Hidden for security]</p>
      </div>
    </div>
  )
} 