'use client'

import { useState, useEffect } from 'react'
import { supabase, ScrapedJob } from '@/lib/supabase'
import JobsOverTimeChart from './analytics/JobsOverTimeChart'
import BudgetAnalysisChart from './analytics/BudgetAnalysisChart'
import SkillsDemandChart from './analytics/SkillsDemandChart'
import ClientActivityChart from './analytics/ClientActivityChart'

export default function AnalyticsDashboard() {
  const [jobs, setJobs] = useState<ScrapedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true)
        // Only fetch jobs that have been fully extracted for accurate analytics
        const { data, error } = await supabase
          .from('scraped_jobs')
          .select('*')
          .not('title', 'is', null)
          .not('client_location', 'is', null)
          .not('budget_amount', 'is', null)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Supabase error:', error)
          setError(error.message)
        } else {
          setJobs(data || [])
        }
      } catch (err) {
        console.error('Error fetching jobs:', err)
        setError('Failed to fetch jobs')
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold gradient-text glow-text">Analytics Dashboard</h2>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full loading-pulse"></div>
            <span className="text-blue-300 text-sm">Loading...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stats-card animate-pulse">
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-8 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="chart-container animate-pulse">
              <div className="h-64 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="futuristic-card p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Analytics</h3>
        <p className="text-gray-400">{error}</p>
      </div>
    )
  }

  // Calculate key metrics
  const totalJobs = jobs.length
  const avgBudget = jobs.length > 0 
    ? jobs.reduce((sum, job) => {
        const budgetMatch = job.budget_amount?.match(/\$?([\d,]+)/)
        return sum + (budgetMatch ? parseFloat(budgetMatch[1].replace(/,/g, '')) : 0)
      }, 0) / jobs.length
    : 0
  
  const activeClients = new Set(jobs.map(job => job.client_location)).size
  
  const topSkills = jobs
    .flatMap(job => {
      const skills = job.skills ? Object.keys(job.skills) : []
      return skills
    })
    .reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  
  const topSkill = Object.entries(topSkills)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text glow-text">Analytics Dashboard</h2>
          <p className="text-blue-300 text-sm mt-1">Key Insights (Based on Complete Data)</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">Live Analytics</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Jobs</p>
              <p className="text-2xl font-bold text-white">{totalJobs.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Avg Budget</p>
              <p className="text-2xl font-bold text-green-400">${avgBudget.toFixed(0)}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Active Clients</p>
              <p className="text-2xl font-bold text-purple-400">{activeClients}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Top Skill</p>
              <p className="text-2xl font-bold text-yellow-400">{topSkill}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', 
        gap: '24px',
        width: '100%'
      }}>
        <div className="chart-container">
          <JobsOverTimeChart jobs={jobs} />
        </div>
        <div className="chart-container">
          <BudgetAnalysisChart jobs={jobs} />
        </div>
        <div className="chart-container">
          <SkillsDemandChart jobs={jobs} />
        </div>
        <div className="chart-container">
          <ClientActivityChart jobs={jobs} />
        </div>
      </div>

      {/* Insights Summary */}
      <div className="clean-card p-8 mt-8">
        <h3 className="section-header mb-4">Key Insights Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="text-accent font-display text-sm">🎯 Market Trends</h4>
            <ul className="space-y-1 text-sm text-muted">
              <li>• {topSkill} is the most in-demand skill</li>
              <li>• Average project budget is ${avgBudget.toFixed(0)}</li>
              <li>• {activeClients} unique clients are actively hiring</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-accent font-display text-sm">💡 Opportunities</h4>
            <ul className="space-y-1 text-sm text-muted">
              <li>• Focus on {topSkill} for highest demand</li>
              <li>• Target clients with ${avgBudget.toFixed(0)}+ budgets</li>
              <li>• Monitor job posting trends for optimal timing</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-accent font-display text-sm">📊 Data Quality</h4>
            <ul className="space-y-1 text-sm text-muted">
              <li>• {totalJobs} complete job records analyzed</li>
              <li>• Real-time data from Supabase</li>
              <li>• Filtered for fully extracted jobs only</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 