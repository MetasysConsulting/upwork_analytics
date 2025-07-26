'use client'

import { useState, useEffect } from 'react'
import { supabase, ScrapedJob } from '@/lib/supabase'
import { 
  Search, 
  Calendar, 
  MapPin, 
  RefreshCw, 
  Repeat, 
  Lightbulb, 
  Briefcase,
  DollarSign,
  Users,
  Link,
  Building,
  Star,
  ExternalLink,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

export default function JobsList() {
  const [jobs, setJobs] = useState<ScrapedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'expert' | 'intermediate' | 'entry'>('all')

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

  // Filter jobs based on search and filter
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' || 
                         job.experience_level?.toLowerCase().includes(selectedFilter)
    
    return matchesSearch && matchesFilter
  })

  // Helper function to safely parse skills
  const parseSkills = (skillsData: string | null): string[] => {
    if (!skillsData || skillsData === '[]' || skillsData === '') {
      return []
    }
    
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(skillsData)
      if (Array.isArray(parsed)) {
        return parsed.filter(skill => skill && typeof skill === 'string')
      }
    } catch (error) {
      // If JSON parsing fails, try to split as comma-separated string
      if (typeof skillsData === 'string') {
        return skillsData
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0)
      }
    }
    
    return []
  }

  const getExperienceColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'expert': return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
      case 'intermediate': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'entry level': return 'text-green-400 bg-green-500/10 border-green-500/20'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  const getProjectTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'ongoing project': return <Repeat className="w-3 h-3" />
      case 'complex project': return <Lightbulb className="w-3 h-3" />
      default: return <Briefcase className="w-3 h-3" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="clean-header animate-pulse">
        <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="h-8 w-64 bg-white/10 rounded-lg"></div>
              <div className="h-4 w-48 bg-white/5 rounded"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <div className="h-4 w-20 bg-white/10 rounded"></div>
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <div className="h-12 flex-1 bg-white/5 rounded-xl"></div>
            <div className="h-12 w-32 bg-white/5 rounded-lg"></div>
          </div>
        </div>

        {/* Loading Job Cards */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="clean-job-card animate-pulse">
              {/* Loading Job Header */}
              <div className="job-header">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-4">
                    <div className="space-y-3">
                      <div className="h-6 bg-white/10 rounded-lg w-3/4"></div>
                      <div className="flex space-x-4">
                        <div className="h-4 bg-white/5 rounded w-24"></div>
                        <div className="h-4 bg-white/5 rounded w-32"></div>
                        <div className="h-4 bg-white/5 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <div className="h-6 bg-white/10 rounded-lg w-20"></div>
                      <div className="h-6 bg-white/10 rounded-lg w-16"></div>
                    </div>
                  </div>
                  <div className="h-10 w-32 bg-white/10 rounded-lg"></div>
                </div>
              </div>
              
                                            {/* Loading Stats Grid */}
               <div className="stats-grid">
                 <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="clean-stats-card">
                        <div className="h-3 bg-white/5 rounded w-16 mb-3"></div>
                        <div className="h-5 bg-white/10 rounded w-20 mb-2"></div>
                        <div className="h-3 bg-white/5 rounded w-14"></div>
                      </div>
                    ))}
                  </div>
              </div>
              
              {/* Loading Description */}
              <div className="description-section">
                <div className="h-4 bg-white/5 rounded w-24 mb-3"></div>
                <div className="description-content">
                  <div className="space-y-2">
                    <div className="h-4 bg-white/5 rounded w-full"></div>
                    <div className="h-4 bg-white/5 rounded w-4/5"></div>
                    <div className="h-4 bg-white/5 rounded w-3/5"></div>
                  </div>
                </div>
              </div>
              
              {/* Loading Skills */}
              <div className="skills-section">
                <div className="h-4 bg-white/5 rounded w-20 mb-3"></div>
                <div className="skills-grid">
                  {[...Array(6)].map((_, k) => (
                    <div key={k} className="h-6 bg-white/10 rounded w-16"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="clean-error-card">
        <div className="flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-xl mx-auto mb-6 ring-1 ring-red-500/20">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-red-400 mb-3">Unable to Load Jobs</h3>
        <p className="text-muted leading-relaxed mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="clean-button"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Clean Header */}
      <div className="clean-header">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-primary">Job Opportunities</h2>
            <p className="text-muted text-sm">
              {filteredJobs.length} of {jobs.length} opportunities • Sorted by latest extracted
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="clean-live-indicator">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span className="text-accent text-sm font-medium">Live Data</span>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search jobs, skills, keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="clean-search-input"
            />
          </div>
          
          <div className="flex space-x-3">
            {['all', 'expert', 'intermediate', 'entry'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter as any)}
                className={`clean-filter-btn ${selectedFilter === filter ? 'active' : ''}`}
              >
                {filter === 'all' ? 'All Levels' : 
                 filter === 'entry' ? 'Entry Level' : 
                 filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="clean-empty-state">
          <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4 ring-1 ring-accent/20">
            <Search className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-xl font-semibold text-primary mb-3">No Matching Jobs</h3>
          <p className="text-muted leading-relaxed mb-6">
            Try adjusting your search terms or filters to find more opportunities.
          </p>
          <button 
            onClick={() => {
              setSearchTerm('')
              setSelectedFilter('all')
            }}
            className="clean-button"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job, index) => (
            <div 
              key={job.id} 
              className="clean-job-card group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Job Header Section */}
              <div className="job-header">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <h3 className="job-title group-hover:text-accent transition-colors duration-200">
                        {job.title || 'Untitled Position'}
                  </h3>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="job-metadata-item text-muted">
                          <Calendar className="w-4 h-4" />
                          <span>Extracted {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}</span>
                        </div>
                        
                        <div className="job-metadata-item text-muted">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location || 'Remote Worldwide'}</span>
                        </div>

                        <div className="job-metadata-item text-muted">
                          {getProjectTypeIcon(job.project_type || '')}
                          <span>{job.project_type || 'Project'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Experience Level Badge */}
                    <div className="flex items-center space-x-3">
                      <span className={`clean-badge ${getExperienceColor(job.experience_level || '')}`}>
                        {job.experience_level || 'Level Not Specified'}
                      </span>
                      
                      {job.client_rating && (
                        <div className="rating-display text-yellow-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">{job.client_rating}</span>
                          <span className="text-xs text-muted">({job.client_reviews_count || 0} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>

                <a
                  href={job.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                    className="clean-cta-button group/cta"
                >
                    <span>View Opportunity</span>
                    <ExternalLink className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform duration-200" />
                </a>
                </div>
              </div>

              {/* Stats Grid Section */}
              <div className="stats-grid">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="clean-stats-card group/stat">
                    <div className="flex items-center justify-between">
                      <span className="stats-label">Budget Range</span>
                      <DollarSign className="w-4 h-4 text-accent group-hover/stat:scale-110 transition-transform" />
                    </div>
                    <div className="stats-value text-accent">
                      {job.budget_amount || 'To Be Determined'}
                    </div>
                    <div className="stats-meta">{job.budget_type || 'Rate TBD'}</div>
                  </div>
                  
                  <div className="clean-stats-card group/stat">
                    <div className="flex items-center justify-between">
                      <span className="stats-label">Competition</span>
                      <Users className="w-4 h-4 text-blue-400 group-hover/stat:scale-110 transition-transform" />
                    </div>
                    <div className="stats-value text-blue-400">
                      {job.proposals_count || '0'} proposals
                    </div>
                    <div className="stats-meta">
                      {job.interviewing_count ? `${job.interviewing_count} interviewing` : 'No interviews yet'}
                </div>
                  </div>
                  
                  <div className="clean-stats-card group/stat">
                    <div className="flex items-center justify-between">
                      <span className="stats-label">Investment</span>
                      <Link className="w-4 h-4 text-purple-400 group-hover/stat:scale-110 transition-transform" />
                </div>
                    <div className="stats-value text-purple-400">
                      {job.connects_required || '0'} connects
                  </div>
                    <div className="stats-meta">Required to apply</div>
                  </div>
                  
                  <div className="clean-stats-card group/stat">
                    <div className="flex items-center justify-between">
                      <span className="stats-label">Client Profile</span>
                      <Building className="w-4 h-4 text-orange-400 group-hover/stat:scale-110 transition-transform" />
                </div>
                    <div className="stats-value text-orange-400">
                      {job.client_total_spent ? `$${parseInt(job.client_total_spent.replace(/[^0-9]/g, '')).toLocaleString()} spent` : 'New Client'}
                  </div>
                    <div className="stats-meta">
                      {job.client_total_hires ? `${job.client_total_hires} previous hires` : 'First time hiring'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Description Section */}
              {job.description && (
                <div className="description-section">
                  <h4 className="section-title">Project Description</h4>
                  <div className="description-content">
                    <p className="leading-relaxed line-clamp-3 text-secondary">
                  {job.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Skills Section */}
              {(() => {
                const skills = parseSkills(job.skills)
                return skills.length > 0 && (
                  <div className="skills-section">
                    <h4 className="section-title">Required Skills</h4>
                    <div className="skills-grid">
                      {skills.slice(0, 10).map((skill: string, index: number) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                      {skills.length > 10 && (
                        <span className="skill-tag more-skills">
                          +{skills.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 