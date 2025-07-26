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
  
  People as PeopleIcon,
  Code as CodeIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material'
import { supabase } from '@/lib/supabase'
import type { ScrapedJob } from '@/lib/supabase'

export default function MaterialJobsList() {
  const theme = useTheme()
  const [jobs, setJobs] = useState<ScrapedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')

  // Fetch jobs on component mount
  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('scraped_jobs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000)

        if (error) {
          console.error('Error fetching jobs:', error)
          return
        }

        setJobs(data || [])
        
      } catch (error) {
        console.error('Unexpected error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

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
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Job Opportunities
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Discover {jobs.length} latest opportunities from Upwork marketplace
        </Typography>
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
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </Typography>
        <Chip 
          icon={<TrendingUpIcon />}
          label="Live Data" 
          color="success" 
          variant="outlined" 
          size="small" 
        />
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
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  )
} 