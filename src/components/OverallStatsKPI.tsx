'use client'

import { useState, useEffect } from 'react'
import { Box, Card, Typography, Skeleton, useTheme, Stack } from '@mui/material'
import WorkIcon from '@mui/icons-material/Work'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import StarIcon from '@mui/icons-material/Star'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import BoltIcon from '@mui/icons-material/Bolt'

interface OverallStats {
  total_jobs: number
  total_complete_jobs: number
  avg_client_rating: number
  total_client_spending: string
  avg_hourly_rate: number
  total_connects_required: number
}

interface OverallStatsKPIProps {
  fromDate?: string
}

interface KPI {
  label: string
  value: string
  subValue?: string
  icon: React.ReactNode
  color: string
}

export default function OverallStatsKPI({ fromDate }: OverallStatsKPIProps) {
  const [stats, setStats] = useState<OverallStats | null>(null)
  const [loading, setLoading] = useState(true)
  const theme = useTheme()

  useEffect(() => {
    let cancelled = false

    async function fetchStats() {
      try {
        setLoading(true)
        const query = fromDate ? `?from_date=${encodeURIComponent(fromDate)}` : ''
        const response = await fetch(`/api/metrics/overall-stats${query}`)
        const result = await response.json()
        if (!cancelled && result.data) {
          setStats(result.data)
        }
      } catch {
        // non-critical – KPI strip silently degrades
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchStats()
    return () => { cancelled = true }
  }, [fromDate])

  const avgConnects =
    stats && stats.total_jobs > 0
      ? Math.round(stats.total_connects_required / stats.total_jobs)
      : null

  const completeRate =
    stats && stats.total_jobs > 0
      ? Math.round((stats.total_complete_jobs / stats.total_jobs) * 100)
      : null

  const kpis: KPI[] = [
    {
      label: 'Total Jobs',
      value: stats ? stats.total_jobs.toLocaleString() : '—',
      icon: <WorkIcon sx={{ fontSize: 22 }} />,
      color: theme.palette.primary.main,
    },
    {
      label: 'Complete Listings',
      value: stats ? stats.total_complete_jobs.toLocaleString() : '—',
      subValue: completeRate !== null ? `${completeRate}% of total` : undefined,
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 22 }} />,
      color: '#22c55e',
    },
    {
      label: 'Avg Client Rating',
      value: stats ? `${Number(stats.avg_client_rating || 0).toFixed(2)} / 5` : '—',
      icon: <StarIcon sx={{ fontSize: 22 }} />,
      color: '#f59e0b',
    },
    {
      label: 'Avg Hourly Rate',
      value: stats ? `$${Number(stats.avg_hourly_rate || 0).toFixed(0)}/hr` : '—',
      icon: <AttachMoneyIcon sx={{ fontSize: 22 }} />,
      color: '#06b6d4',
    },
    {
      label: 'Avg Connects',
      value: avgConnects !== null ? String(avgConnects) : '—',
      subValue: 'per listing',
      icon: <BoltIcon sx={{ fontSize: 22 }} />,
      color: '#8b5cf6',
    },
  ]

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: `repeat(${kpis.length}, 1fr)` },
        gap: 2,
        mb: 3,
        width: '100%',
      }}
    >
      {kpis.map((kpi) => (
        <Card
          key={kpi.label}
          elevation={1}
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: 2,
            borderTop: `3px solid ${kpi.color}`,
            backgroundColor: 'background.paper',
          }}
        >
          <Stack direction="row" alignItems="flex-start" spacing={1.5}>
            <Box
              sx={{
                color: kpi.color,
                mt: 0.25,
                flexShrink: 0,
              }}
            >
              {kpi.icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 500, display: 'block', whiteSpace: 'nowrap' }}
              >
                {kpi.label}
              </Typography>
              {loading ? (
                <Skeleton width={64} height={28} />
              ) : (
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {kpi.value}
                </Typography>
              )}
              {kpi.subValue && !loading && (
                <Typography variant="caption" color="text.secondary">
                  {kpi.subValue}
                </Typography>
              )}
            </Box>
          </Stack>
        </Card>
      ))}
    </Box>
  )
}
