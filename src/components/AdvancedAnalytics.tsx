'use client'

import { useState, useEffect } from 'react'
import { supabase, ScrapedJob } from '@/lib/supabase'
import JobsOverTimeChart from './analytics/JobsOverTimeChart'
import SkillsDemandChart from './analytics/SkillsDemandChart'
import BudgetAnalysisChart from './analytics/BudgetAnalysisChart'
import ClientActivityChart from './analytics/ClientActivityChart'
import ClientCountriesChart from './analytics/ClientCountriesChart'
import ClientSpendingChart from './analytics/ClientSpendingChart'
import ConnectsRequiredChart from './analytics/ConnectsRequiredChart'
import InterviewingRateChart from './analytics/InterviewingRateChart'
import ClientHireRateChart from './analytics/ClientHireRateChart'
import ClientHourlyRateChart from './analytics/ClientHourlyRateChart'
import JobPostingHeatmap from './analytics/JobPostingHeatmap'

export default function AdvancedAnalytics() {
  const [jobs, setJobs] = useState<ScrapedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true)
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
          <h2 className="text-2xl font-bold gradient-text glow-text">Advanced Analytics</h2>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full loading-pulse"></div>
            <span className="text-blue-300 text-sm">Loading...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(11)].map((_, i) => (
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text glow-text">Advanced Analytics</h2>
          <p className="text-blue-300 text-sm mt-1">Complete Analytics Coverage - {jobs.length} Jobs Analyzed</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">Real-time Data</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', 
        gap: '24px',
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        justifyItems: 'center'
      }}>
        <div className="chart-container" style={{ width: '100%', maxWidth: '700px' }}>
          <JobsOverTimeChart jobs={jobs} />
        </div>
        <div className="chart-container" style={{ width: '100%', maxWidth: '700px' }}>
          <SkillsDemandChart jobs={jobs} />
        </div>
        <div className="chart-container" style={{ width: '100%', maxWidth: '700px' }}>
          <BudgetAnalysisChart jobs={jobs} />
        </div>
        <div className="chart-container" style={{ width: '100%', maxWidth: '700px' }}>
          <ClientActivityChart jobs={jobs} />
        </div>
        <div className="chart-container" style={{ width: '100%', maxWidth: '700px' }}>
          <ClientCountriesChart jobs={jobs} />
        </div>
        <div className="chart-container" style={{ width: '100%', maxWidth: '700px' }}>
          <ClientSpendingChart jobs={jobs} />
        </div>
        <div className="chart-container" style={{ width: '100%', maxWidth: '700px' }}>
          <ConnectsRequiredChart jobs={jobs} />
        </div>
        <div className="chart-container" style={{ width: '100%', maxWidth: '700px' }}>
          <InterviewingRateChart jobs={jobs} />
        </div>
        <div className="chart-container" style={{ width: '100%', maxWidth: '700px' }}>
          <ClientHireRateChart jobs={jobs} />
        </div>
        <div className="chart-container" style={{ width: '100%', maxWidth: '700px' }}>
          <ClientHourlyRateChart jobs={jobs} />
        </div>
        
      </div>

      {/* Full width heatmap - outside the grid to break free from maxWidth constraint */}
      <div style={{ 
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        marginTop: '32px',
        marginBottom: '32px'
      }}>
        <JobPostingHeatmap jobs={jobs} />
      </div>

      {/* Insights Summary */}
      <div className="clean-card p-8 mt-8">
        <h3 className="section-header mb-6">Complete Analytics Coverage</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h4 className="text-accent font-display text-sm">📈 Market Trends</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>• Job posting patterns over time</li>
              <li>• Budget distribution analysis</li>
              <li>• Skills demand trends</li>
              <li>• Geographic job distribution</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-accent font-display text-sm">👥 Client Insights</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>• Client spending patterns</li>
              <li>• Hiring behavior analysis</li>
              <li>• Interview success rates</li>
              <li>• Hourly rate analysis</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-accent font-display text-sm">🎯 Strategic Insights</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>• Optimal proposal timing</li>
              <li>• Connect requirements</li>
              <li>• High-value opportunities</li>
              <li>• Market positioning</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 