'use client'

import { useState, useEffect } from 'react'
import { supabase, ScrapedJob } from '@/lib/supabase'
import JobsList from '@/components/JobsList'
import JobsOverTimeChart from '@/components/analytics/JobsOverTimeChart'
import BudgetAnalysisChart from '@/components/analytics/BudgetAnalysisChart'
import SkillsDemandChart from '@/components/analytics/SkillsDemandChart'
import ClientActivityChart from '@/components/analytics/ClientActivityChart'
import ClientCountriesChart from '@/components/analytics/ClientCountriesChart'
import ClientSpendingChart from '@/components/analytics/ClientSpendingChart'
import ClientHireRateChart from '@/components/analytics/ClientHireRateChart'
import ConnectsRequiredChart from '@/components/analytics/ConnectsRequiredChart'
import InterviewingRateChart from '@/components/analytics/InterviewingRateChart'
import ClientHourlyRateChart from '@/components/analytics/ClientHourlyRateChart'
import JobPostingHeatmap from '@/components/analytics/JobPostingHeatmap'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'jobs-over-time' | 'budget-analysis' | 'skills-demand' | 'client-activity' | 'client-countries' | 'client-spending' | 'client-hire-rate' | 'connects-required' | 'interviewing-rate' | 'client-hourly-rate' | 'job-heatmap'>('jobs')
  const [jobs, setJobs] = useState<ScrapedJob[]>([])
  const [loading, setLoading] = useState(true)

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
        } else {
          setJobs(data || [])
        }
      } catch (err) {
        console.error('Error fetching jobs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  return (
    <div style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      <div className="min-h-screen">
        {/* Header */}
        <header className="clean-card border-0 rounded-none border-b border-white/8">
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', width: '100%' }} className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-primary">Upwork Analytics</h1>
                  <p className="text-muted text-sm">Job market insights and analysis</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-accent text-sm font-medium">Connected to Supabase</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="clean-tabs">
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', width: '100%' }}>
            <nav className="flex space-x-1 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('jobs')} 
                className={`clean-tab ${activeTab === 'jobs' ? 'active' : ''}`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Jobs</span>
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('jobs-over-time')} 
                className={`clean-tab ${activeTab === 'jobs-over-time' ? 'active' : ''}`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  <span>Jobs Over Time</span>
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('budget-analysis')} 
                className={`clean-tab ${activeTab === 'budget-analysis' ? 'active' : ''}`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span>Budget</span>
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('skills-demand')} 
                className={`clean-tab ${activeTab === 'skills-demand' ? 'active' : ''}`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Skills</span>
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('client-activity')} 
                className={`clean-tab ${activeTab === 'client-activity' ? 'active' : ''}`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Clients</span>
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('client-countries')} 
                className={`clean-tab ${activeTab === 'client-countries' ? 'active' : ''}`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Countries</span>
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('client-spending')} 
                className={`clean-tab ${activeTab === 'client-spending' ? 'active' : ''}`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                  <span>Spending</span>
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('client-hire-rate')} 
                className={`clean-tab ${activeTab === 'client-hire-rate' ? 'active' : ''}`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Hire Rate</span>
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('connects-required')} 
                className={`clean-tab ${activeTab === 'connects-required' ? 'active' : ''}`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span>Connects</span>
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('interviewing-rate')} 
                className={`clean-tab ${activeTab === 'interviewing-rate' ? 'active' : ''}`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Interviews</span>
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('client-hourly-rate')} 
                className={`clean-tab ${activeTab === 'client-hourly-rate' ? 'active' : ''}`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Hourly Rate</span>
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('job-heatmap')} 
                className={`clean-tab ${activeTab === 'job-heatmap' ? 'active' : ''}`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Heatmap</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', width: '100%' }} className="py-8">
          {activeTab === 'jobs' && <JobsList />}
          {activeTab === 'jobs-over-time' && (
            <div className="chart-container">
              <JobsOverTimeChart jobs={jobs} />
            </div>
          )}
          {activeTab === 'budget-analysis' && (
            <div className="chart-container">
              <BudgetAnalysisChart jobs={jobs} />
            </div>
          )}
          {activeTab === 'skills-demand' && (
            <div className="chart-container">
              <SkillsDemandChart jobs={jobs} />
            </div>
          )}
          {activeTab === 'client-activity' && (
            <div className="chart-container">
              <ClientActivityChart jobs={jobs} />
            </div>
          )}
          {activeTab === 'client-countries' && (
            <div className="chart-container">
              <ClientCountriesChart jobs={jobs} />
            </div>
          )}
          {activeTab === 'client-spending' && (
            <div className="chart-container">
              <ClientSpendingChart jobs={jobs} />
            </div>
          )}
          {activeTab === 'client-hire-rate' && (
            <div className="chart-container">
              <ClientHireRateChart jobs={jobs} />
            </div>
          )}
          {activeTab === 'connects-required' && (
            <div className="chart-container">
              <ConnectsRequiredChart jobs={jobs} />
            </div>
          )}
          {activeTab === 'interviewing-rate' && (
            <div className="chart-container">
              <InterviewingRateChart jobs={jobs} />
            </div>
          )}
          {activeTab === 'client-hourly-rate' && (
            <div className="chart-container">
              <ClientHourlyRateChart jobs={jobs} />
            </div>
          )}
          {activeTab === 'job-heatmap' && (
            <div className="chart-container">
              <JobPostingHeatmap jobs={jobs} />
            </div>
          )}
      </main>

        {/* Footer */}
        <footer className="clean-card border-0 rounded-none border-t border-white/8 mt-16">
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', width: '100%' }} className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-muted text-sm">Powered by Supabase</span>
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                <span className="text-muted text-sm">Real-time Analytics</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-muted text-sm">© 2024 Upwork Analytics</span>
              </div>
            </div>
          </div>
      </footer>
      </div>
    </div>
  )
}
