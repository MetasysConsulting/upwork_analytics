'use client'

import { useState, useEffect } from 'react'
import { supabase, ScrapedJob } from '@/lib/supabase'

export default function JobsList() {
  const [jobs, setJobs] = useState<ScrapedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true)
        console.log('Fetching fully extracted jobs from Supabase...')
        const { data, error } = await supabase
          .from('scraped_jobs')
          .select('*')
          .not('title', 'is', null)
          .not('client_location', 'is', null)
          .not('budget_amount', 'is', null)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) {
          console.error('Supabase error:', error)
          setError(error.message)
        } else {
          console.log('Jobs fetched successfully:', data?.length || 0)
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">Recent Jobs (Fully Extracted)</h2>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-accent rounded-full loading-pulse"></div>
            <span className="text-muted text-sm">Loading...</span>
          </div>
        </div>
        <div className="grid gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="job-card animate-pulse">
              <div className="h-6 bg-white/10 rounded mb-3"></div>
              <div className="h-4 bg-white/10 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-white/10 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="clean-card p-8 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Jobs</h3>
        <p className="text-muted">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-primary">Recent Jobs (Fully Extracted)</h2>
          <p className="text-muted text-sm mt-1">{jobs.length} complete jobs found</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-accent rounded-full"></div>
          <span className="text-accent text-sm font-medium">Live Data</span>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="clean-card p-8 text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-accent mb-2">No Jobs Found</h3>
          <p className="text-muted">No fully extracted jobs are currently available.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => (
            <div key={job.id} className="job-card group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 max-w-3xl">
                  <h3 className="text-lg font-semibold text-primary group-hover:text-accent transition-colors mb-3">
                    {job.title || 'Untitled Job'}
                  </h3>
                  <div className="flex items-center space-x-6 text-sm text-muted mb-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Posted: {job.posted_date || 'Unknown date'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{job.location || 'Worldwide'}</span>
                    </div>
                  </div>
                </div>
                <a
                  href={job.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clean-button text-sm px-4 py-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-4"
                >
                  View Job →
                </a>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="stats-card">
                  <div className="text-sm text-muted mb-1">Budget</div>
                  <div className="text-lg font-semibold text-accent">
                    {job.budget_amount || 'Not specified'}
                  </div>
                  <div className="text-xs text-muted">{job.budget_type}</div>
                </div>
                
                <div className="stats-card">
                  <div className="text-sm text-muted mb-1">Experience</div>
                  <div className="text-lg font-semibold text-secondary">
                    {job.experience_level || 'Not specified'}
                  </div>
                  <div className="text-xs text-muted">{job.project_type}</div>
                </div>
                
                <div className="stats-card">
                  <div className="text-sm text-muted mb-1">Proposals</div>
                  <div className="text-lg font-semibold text-secondary">
                    {job.proposals_count || '0'}
                  </div>
                  <div className="text-xs text-muted">
                    {job.interviewing_count ? `${job.interviewing_count} interviewing` : ''}
                  </div>
                </div>
                
                <div className="stats-card">
                  <div className="text-sm text-muted mb-1">Connects</div>
                  <div className="text-lg font-semibold text-secondary">
                    {job.connects_required || '0'}
                  </div>
                  {job.client_rating && (
                    <div className="text-xs text-muted">
                      ★ {job.client_rating} ({job.client_reviews_count || 0})
                    </div>
                  )}
                </div>
              </div>

              {job.description && (
                <div className="text-secondary text-sm line-clamp-2 leading-relaxed">
                  {job.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 