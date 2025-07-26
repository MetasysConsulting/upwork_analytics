'use client'

import { useState, useEffect } from 'react'
import { Box, Container, useTheme, useMediaQuery, CircularProgress, Typography } from '@mui/material'
import { supabase } from '@/lib/supabase'
import type { ScrapedJob } from '@/lib/supabase'

// Import chart components (keeping existing charts for now)
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

// Import Material UI components
import MaterialSidebar from '@/components/MaterialSidebar'
import MaterialJobsList from '@/components/MaterialJobsList'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'premium-map' | 'jobs-over-time' | 'budget-analysis' | 'client-countries' | 'client-spending' | 'client-hire-rate' | 'client-hourly-rate' | 'connects-required' | 'interview-rate' | 'skills-demand' | 'posting-heatmap'>('jobs')
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
          .limit(1000)

        if (error) {
          console.error('Error fetching jobs:', error)
          return
        }

        setJobs(data || [])
      } catch (error) {
        console.error('Unexpected error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading analytics data...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Material UI Sidebar */}
      <MaterialSidebar
        activeTab={activeTab}
        onTabChange={(tab: string) => setActiveTab(tab as any)}
        jobCount={jobs.length}
      />

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'background.default',
          color: 'text.primary',
          backgroundImage: theme.palette.mode === 'dark' 
            ? 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.03) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.02) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.02) 0%, transparent 50%)'
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{ 
            py: 4,
            px: { xs: 2, sm: 3, md: 4 },
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {activeTab === 'jobs' && (
            <Box sx={{ width: '100%', maxWidth: '1400px' }}>
              <MaterialJobsList />
            </Box>
          )}
          
          {activeTab === 'jobs-over-time' && (
            <Box className="chart-container" sx={{ width: '100%', maxWidth: '1400px' }}>
              <JobsOverTimeChart jobs={jobs} />
            </Box>
          )}
          
          {activeTab === 'premium-map' && (
            <Box className="chart-container" sx={{ width: '100%', maxWidth: '1400px' }}>
              <ClientActivityChart jobs={jobs} />
            </Box>
          )}
          
          {activeTab === 'budget-analysis' && (
            <Box className="chart-container">
              <BudgetAnalysisChart jobs={jobs} />
            </Box>
          )}
          
          {activeTab === 'client-countries' && (
            <Box className="chart-container">
              <ClientCountriesChart jobs={jobs} />
            </Box>
          )}
          
          {activeTab === 'client-spending' && (
            <Box className="chart-container">
              <ClientSpendingChart jobs={jobs} />
            </Box>
          )}
          
          {activeTab === 'client-hire-rate' && (
            <Box className="chart-container">
              <ClientHireRateChart jobs={jobs} />
            </Box>
          )}
          
          {activeTab === 'client-hourly-rate' && (
            <Box className="chart-container">
              <ClientHourlyRateChart jobs={jobs} />
            </Box>
          )}
          
          {activeTab === 'connects-required' && (
            <Box className="chart-container">
              <ConnectsRequiredChart jobs={jobs} />
            </Box>
          )}
          
          {activeTab === 'interview-rate' && (
            <Box className="chart-container">
              <InterviewingRateChart jobs={jobs} />
            </Box>
          )}
          
          {activeTab === 'skills-demand' && (
            <Box className="chart-container">
              <SkillsDemandChart jobs={jobs} />
            </Box>
          )}
          
          {activeTab === 'posting-heatmap' && (
            <Box className="chart-container" sx={{ width: '100%', maxWidth: '1400px' }}>
              <JobPostingHeatmap jobs={jobs} />
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  )
}
