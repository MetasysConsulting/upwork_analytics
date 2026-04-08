'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Badge,
  Button,
  Paper,
  Stack,
  Divider,
  Avatar,
  IconButton,
  InputAdornment,
  Skeleton,
  Alert,
  useTheme,
  alpha,
  Pagination,
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  OpenInNew as OpenInNewIcon,
  AutoAwesome as AutoAwesomeIcon,
  People as PeopleIcon,
  Code as CodeIcon,
  AccessTime as AccessTimeIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
} from '@mui/icons-material'
import { supabase } from '@/lib/supabase'
import type { ScrapedJob } from '@/lib/supabase'
import ProposalModal from './ProposalModal'

const JOBS_PER_PAGE = 100

interface MaterialJobsListProps {
  fromDate?: string
  timeRange?: '1w' | '1m' | '3m' | '6m' | '1y'
}

export default function MaterialJobsList({ fromDate, timeRange = '1m' }: MaterialJobsListProps) {
  const theme = useTheme()
  const [jobs, setJobs] = useState<ScrapedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalJobs, setTotalJobs] = useState<number>(0)
  const [totalCompleteJobs, setTotalCompleteJobs] = useState<number>(0)
  
  // Proposal modal state
  const [proposalModalOpen, setProposalModalOpen] = useState(false)
  const [proposal, setProposal] = useState<string | null>(null)
  const [proposalLoading, setProposalLoading] = useState(false)
  const [proposalError, setProposalError] = useState<string | null>(null)

  useEffect(() => {
    setCurrentPage(1)
  }, [fromDate])

  // Fetch jobs with pagination
  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true)
        
        const from = (currentPage - 1) * JOBS_PER_PAGE
        const to = from + JOBS_PER_PAGE - 1
        
        let query = supabase
          .from('scraped_jobs')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to)

        if (fromDate) {
          query = query.gte('created_at', fromDate)
        }

        const { data, error, count } = await query

        if (error) {
          console.error('Error fetching jobs:', error)
          return
        }

        setJobs(data || [])
        
        // Update total if we got a count
        if (count !== null) {
          setTotalJobs(count)
        }
        
      } catch (error) {
        console.error('Unexpected error:', error)
        try {
          const countUrl = fromDate
            ? `/api/metrics/total-count?from_date=${encodeURIComponent(fromDate)}`
            : '/api/metrics/total-count'
          const countResponse = await fetch(countUrl)
          const countResult = await countResponse.json()
          if (countResult.total !== undefined) {
            setTotalJobs(countResult.total)
            setTotalCompleteJobs(countResult.complete || 0)
          }
        } catch (countError) {
          console.error('Error fetching range counts:', countError)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [currentPage, fromDate])

  // Helper functions
  const parseSkills = (skillsData: any): string[] => {
    if (!skillsData) return []
    
    try {
      // If it's already an array, return it
      if (Array.isArray(skillsData)) {
        return skillsData.filter(skill => typeof skill === 'string')
      }
      
      // Convert to string if it's not already
      const skillsStr = String(skillsData)
      
      // Try to parse as JSON array first
      if (skillsStr.startsWith('[') && skillsStr.endsWith(']')) {
        const parsed = JSON.parse(skillsStr)
        return Array.isArray(parsed) ? parsed.filter(skill => typeof skill === 'string') : []
      }
      
      // Fallback to comma-separated
      return skillsStr.split(',').map(skill => skill.trim()).filter(Boolean)
    } catch (error) {
      console.error('Error parsing skills:', error, skillsData)
      return []
    }
  }

  const getExperienceColor = (level: string | null) => {
    switch (level?.toLowerCase()) {
      case 'entry level': return 'success'
      case 'intermediate': return 'warning'
      case 'expert': return 'error'
      default: return 'default'
    }
  }

  const getProjectTypeColor = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'complex project': return 'error'
      case 'simple project': return 'success'
      default: return 'info'
    }
  }

  const formatBudget = (budget: string | null) => {
    if (!budget) return 'Not specified'
    return budget
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A'
    try {
      const now = new Date()
      const jobDate = new Date(dateStr)
      const diffMs = now.getTime() - jobDate.getTime()
      
      // Convert to different time units
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const diffWeeks = Math.floor(diffDays / 7)
      const diffMonths = Math.floor(diffDays / 30)
      
      // Return appropriate relative time
      if (diffMinutes < 1) return 'just now'
      if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
      if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
      if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`
      if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`
      
      // For very old dates, show years
      const diffYears = Math.floor(diffDays / 365)
      return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`
      
    } catch {
      return dateStr
    }
  }

  // Generate AI proposal
  const handleGenerateProposal = async (job: ScrapedJob) => {
    setProposalModalOpen(true)
    setProposalLoading(true)
    setProposalError(null)
    setProposal(null)

    try {
      const response = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDetails: {
            title: job.title,
            description: job.description,
            budget_amount: job.budget_amount,
            budget_type: job.budget_type,
            experience_level: job.experience_level,
            skills: parseSkills(job.skills),
            location: job.location,
            client_location: job.client_location,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate proposal')
      }

      setProposal(data.proposal)
    } catch (error: any) {
      console.error('Error generating proposal:', error)
      setProposalError(error.message || 'Failed to generate proposal. Please try again.')
    } finally {
      setProposalLoading(false)
    }
  }

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    const filtered = jobs.filter(job => {
      // If no search term, include ALL jobs (even with null titles)
      let matchesSearch = true
      
      if (searchTerm) {
        matchesSearch = 
          (job.title && job.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (job.client_location && job.client_location.toLowerCase().includes(searchTerm.toLowerCase())) ||
          parseSkills(job.skills).some(skill => 
            skill.toLowerCase().includes(searchTerm.toLowerCase())
          )
      }

      const matchesFilter = selectedFilter === 'all' || 
        job.experience_level === selectedFilter

      return matchesSearch && matchesFilter
    })
    
    return filtered
  }, [jobs, searchTerm, selectedFilter])
  
  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Job Opportunities
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Loading opportunities from Upwork marketplace...
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <CardContent>
                <Skeleton variant="text" width="60%" height="32px" />
                <Skeleton variant="text" width="40%" height="20px" sx={{ mt: 1 }} />
                <Skeleton variant="rectangular" width="100%" height={80} sx={{ mt: 2 }} />
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Skeleton variant="rounded" width={80} height={24} />
                  <Skeleton variant="rounded" width={60} height={24} />
                  <Skeleton variant="rounded" width={70} height={24} />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Job Opportunities
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Showing {jobs.length} jobs ({timeRange.toUpperCase()} range) (Page {currentPage} of {Math.max(1, Math.ceil(totalJobs / JOBS_PER_PAGE))})
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Chip 
              label={`Total: ${totalJobs.toLocaleString()} jobs`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.875rem' }}
            />
            {totalCompleteJobs > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {totalCompleteJobs.toLocaleString()} complete
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Filters */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 60%', minWidth: '300px' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search jobs, skills, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
          <Box sx={{ flex: '1 1 35%', minWidth: '250px' }}>
            <FormControl fullWidth>
              <InputLabel>Experience Level</InputLabel>
              <Select
                value={selectedFilter}
                label="Experience Level"
                onChange={(e) => setSelectedFilter(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterIcon color="action" />
                  </InputAdornment>
                }
                sx={{
                  borderRadius: 2,
                }}
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="Entry level">Entry Level</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Expert">Expert</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* Results Count */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredJobs.length} of {jobs.length} jobs on this page
          </Typography>
          <Chip 
            icon={<TrendingUpIcon />}
            label="Live Data" 
            color="success" 
            variant="outlined" 
            size="small" 
          />
        </Box>
      </Box>

      {/* Job Cards */}
      {filteredJobs.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Typography variant="body1">
            No jobs found matching your criteria. Try adjusting your search or filters.
          </Typography>
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {filteredJobs.map((job) => (
            <Box key={job.id}>
              <Card 
                elevation={2}
                sx={{ 
                  borderRadius: 3,
                  transition: 'all 0.2s ease',
                  backgroundColor: 'background.paper',
                  color: 'text.primary',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack spacing={3}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            color: 'text.primary',
                            lineHeight: 1.3
                          }}
                        >
                          {job.title}
                        </Typography>
                        
                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                          {job.budget_amount && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <MoneyIcon sx={{ fontSize: 16, color: 'success.main' }} />
                              <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                                {formatBudget(job.budget_amount)}
                              </Typography>
                            </Stack>
                          )}
                          
                          {job.experience_level && (
                            <Chip
                              label={job.experience_level}
                              color={getExperienceColor(job.experience_level) as any}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          
                          {job.project_type && (
                            <Chip
                              label={job.project_type}
                              color={getProjectTypeColor(job.project_type) as any}
                              size="small"
                              variant="filled"
                            />
                          )}
                          
                          {job.client_location && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {job.client_location}
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      </Box>
                      
                      {job.created_at && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Extracted {formatDate(job.created_at)}
                          </Typography>
                        </Stack>
                      )}
                    </Box>

                    {/* Description */}
                    {job.description && (
                      <Typography 
                        variant="body1" 
                        color="text.secondary"
                        sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.6
                        }}
                      >
                        {job.description}
                      </Typography>
                    )}

                    {/* Stats */}
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      {job.proposals_count && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <PeopleIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2" color="text.secondary">
                            {job.proposals_count} proposals
                          </Typography>
                        </Stack>
                      )}
                      
                      {job.client_rating && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                          <Typography variant="body2" color="text.secondary">
                            {job.client_rating}/5.0 rating
                          </Typography>
                        </Stack>
                      )}
                      
                      {job.client_total_spent && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <MoneyIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="body2" color="text.secondary">
                            {job.client_total_spent} total spent
                          </Typography>
                        </Stack>
                      )}
                      
                      {job.connects_required && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <WorkIcon sx={{ fontSize: 16, color: 'info.main' }} />
                          <Typography variant="body2" color="text.secondary">
                            {job.connects_required} connects
                          </Typography>
                        </Stack>
                      )}
                    </Box>

                    {/* Skills */}
                    {job.skills && (
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <CodeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Required Skills:
                          </Typography>
                        </Stack>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {parseSkills(job.skills).slice(0, 8).map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="small"
                              variant="outlined"
                              sx={{
                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                borderColor: alpha(theme.palette.primary.main, 0.2),
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                },
                              }}
                            />
                          ))}
                          {parseSkills(job.skills).length > 8 && (
                            <Chip
                              label={`+${parseSkills(job.skills).length - 8} more`}
                              size="small"
                              variant="filled"
                              color="primary"
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    <Divider />

                    {/* Actions */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Job ID: {job.job_id || 'N/A'}
                      </Typography>
                      
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AutoAwesomeIcon />}
                          onClick={() => handleGenerateProposal(job)}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': {
                              borderColor: 'primary.dark',
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          Generate AI Proposal
                        </Button>
                        
                        {job.job_url && (
                          <Button
                            variant="contained"
                            size="small"
                            endIcon={<OpenInNewIcon />}
                            onClick={() => window.open(job.job_url, '_blank')}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600,
                            }}
                          >
                            View on Upwork
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* Pagination */}
      {totalJobs > JOBS_PER_PAGE && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<FirstPageIcon />}
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              size="small"
            >
              First
            </Button>
            <Button
              variant="outlined"
              startIcon={<ChevronLeftIcon />}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              size="small"
            >
              Previous
            </Button>
            <Pagination
              count={Math.ceil(totalJobs / JOBS_PER_PAGE)}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
            <Button
              variant="outlined"
              endIcon={<ChevronRightIcon />}
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalJobs / JOBS_PER_PAGE), prev + 1))}
              disabled={currentPage >= Math.ceil(totalJobs / JOBS_PER_PAGE)}
              size="small"
            >
              Next
            </Button>
            <Button
              variant="outlined"
              endIcon={<LastPageIcon />}
              onClick={() => setCurrentPage(Math.ceil(totalJobs / JOBS_PER_PAGE))}
              disabled={currentPage >= Math.ceil(totalJobs / JOBS_PER_PAGE)}
              size="small"
            >
              Last
            </Button>
          </Stack>
        </Box>
      )}

      {/* Page Info */}
      {totalJobs > JOBS_PER_PAGE && (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Page {currentPage} of {Math.ceil(totalJobs / JOBS_PER_PAGE)} • 
            Showing jobs {(currentPage - 1) * JOBS_PER_PAGE + 1} to {Math.min(currentPage * JOBS_PER_PAGE, totalJobs)} of {totalJobs.toLocaleString()}
          </Typography>
        </Box>
      )}

      {/* Proposal Modal */}
      <ProposalModal
        open={proposalModalOpen}
        onClose={() => {
          setProposalModalOpen(false)
          setProposal(null)
          setProposalError(null)
        }}
        proposal={proposal}
        loading={proposalLoading}
        error={proposalError}
      />
    </Container>
  )
} 