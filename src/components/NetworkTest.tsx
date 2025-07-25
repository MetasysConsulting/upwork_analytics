'use client'

import { useEffect, useState } from 'react'

export default function NetworkTest() {
  const [tests, setTests] = useState<Array<{name: string, status: string, details: string}>>([])

  useEffect(() => {
    async function runTests() {
      const testResults = []

      // Test 1: Basic internet connectivity
      try {
        const response = await fetch('https://httpbin.org/get')
        testResults.push({
          name: 'Internet Connectivity',
          status: response.ok ? '✅ Success' : '❌ Failed',
          details: `Status: ${response.status}`
        })
      } catch (error) {
        testResults.push({
          name: 'Internet Connectivity',
          status: '❌ Failed',
          details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`
        })
      }

      // Test 2: Supabase health check
      try {
        const response = await fetch('https://psegulpmbdaxhjhsfzlb.supabase.co/rest/v1/', {
          method: 'HEAD'
        })
        testResults.push({
          name: 'Supabase Project Reachable',
          status: response.ok ? '✅ Success' : '❌ Failed',
          details: `Status: ${response.status}`
        })
      } catch (error) {
        testResults.push({
          name: 'Supabase Project Reachable',
          status: '❌ Failed',
          details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`
        })
      }

      // Test 3: Supabase with API key
      try {
        const response = await fetch('https://psegulpmbdaxhjhsfzlb.supabase.co/rest/v1/scraped_jobs?select=count&limit=1', {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZWd1bHBtYmRheGhqaHNmemxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNTM5MzAsImV4cCI6MjA2ODkyOTkzMH0.XvkwT_fX3JzJ8TrRFunMN-d41XWrb_V2mnpGiCfCUis',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZWd1bHBtYmRheGhqaHNmemxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNTM5MzAsImV4cCI6MjA2ODkyOTkzMH0.XvkwT_fX3JzJ8TrRFunMN-d41XWrb_V2mnpGiCfCUis'
          }
        })
        testResults.push({
          name: 'Supabase API Access',
          status: response.ok ? '✅ Success' : '❌ Failed',
          details: `Status: ${response.status} - ${response.statusText}`
        })
      } catch (error) {
        testResults.push({
          name: 'Supabase API Access',
          status: '❌ Failed',
          details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`
        })
      }

      setTests(testResults)
    }

    runTests()
  }, [])

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-yellow-900 mb-2">Network Connectivity Test</h3>
      <div className="space-y-2">
        {tests.map((test, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <span className="font-medium text-yellow-800">{test.name}:</span>
            <div className="text-right">
              <span className={test.status.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                {test.status}
              </span>
              <div className="text-xs text-yellow-700">{test.details}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 