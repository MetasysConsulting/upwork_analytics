'use client'

import ReactECharts from 'echarts-for-react'
import { useState, useEffect } from 'react'
import { CircularProgress, Box, Typography, Stack, Button } from '@mui/material'

interface BudgetAnalysisChartProps {
  fromDate?: string
}

interface BudgetRangeData {
  budget_range: string
  job_count: number
  avg_budget: number
}

export default function BudgetAnalysisChart({ fromDate }: BudgetAnalysisChartProps) {
  const [budgetData, setBudgetData] = useState<BudgetRangeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [budgetMode, setBudgetMode] = useState<'all' | 'fixed' | 'hourly'>('all')

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (fromDate) params.set('from_date', fromDate)
        params.set('budget_mode', budgetMode)
        const response = await fetch(`/api/metrics/budget-analysis?${params.toString()}`)
        const result = await response.json()

        if (!response.ok) {
          const errorMsg = result.error || result.details || 'Failed to fetch metrics'
          console.error('Budget analysis API error:', result)
          throw new Error(errorMsg)
        }

        const data = result.data || []
        // Ensure data is an array and has the expected format
        if (Array.isArray(data) && data.length > 0) {
          setBudgetData(data)
        } else {
          console.warn('Budget analysis API returned empty or invalid data:', data)
          setBudgetData([])
        }
      } catch (err: any) {
        console.error('Error fetching budget analysis:', err)
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [fromDate, budgetMode])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', padding: '60px', color: 'error.main' }}>
        <Typography variant="h6" color="error">Error loading data</Typography>
        <Typography variant="body2">{error}</Typography>
      </Box>
    )
  }

  if (budgetData.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px',
        background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(255, 193, 7, 0.3) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ffffff'
      }}>
        <h3 style={{ color: '#FFC107' }}>No budget data available</h3>
      </div>
    )
  }

  // Map budget ranges from API to chart format
  const rangeMapping: Record<string, { color: string; description: string; order: number }> = {
    'Fixed: < $100': { color: '#FF6B6B', description: 'Quick tasks and fixes', order: 1 },
    'Fixed: $100-$500': { color: '#FFB347', description: 'Short-term fixed work', order: 2 },
    'Fixed: $500-$1,000': { color: '#4ECDC4', description: 'Standard fixed projects', order: 3 },
    'Fixed: $1,000-$5,000': { color: '#45B7D1', description: 'Major fixed deliverables', order: 4 },
    'Fixed: $5,000+': { color: '#FD79A8', description: 'High-value fixed contracts', order: 5 },
    'Hourly: < $15/hr': { color: '#7C3AED', description: 'Entry hourly rates', order: 6 },
    'Hourly: $15-$25/hr': { color: '#8B5CF6', description: 'Developing hourly range', order: 7 },
    'Hourly: $25-$40/hr': { color: '#3B82F6', description: 'Core market hourly range', order: 8 },
    'Hourly: $40-$60/hr': { color: '#10B981', description: 'Experienced hourly range', order: 9 },
    'Hourly: $60+/hr': { color: '#F59E0B', description: 'Premium hourly rates', order: 10 },
    'Unknown': { color: '#6B7280', description: 'Unspecified budget', order: 99 }
  }

  const rangeCounts = budgetData.map(item => {
    const mapping = rangeMapping[item.budget_range] || { color: '#9B59B6', description: 'Other', order: 98 }
    const totalJobs = budgetData.reduce((sum, r) => sum + Number(r.job_count || 0), 0)
    
    return {
      name: item.budget_range || 'Unknown',
      count: Number(item.job_count || 0),
      percentage: totalJobs > 0 ? ((Number(item.job_count || 0) / totalJobs) * 100) : 0,
      avgBudget: Math.round(Number(item.avg_budget || 0)),
      ...mapping
    }
  }).filter(range => range.count > 0).sort((a, b) => a.order - b.order)

  if (rangeCounts.length === 0) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        padding: '60px',
        background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(255, 193, 7, 0.3) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ffffff'
      }}>
        <Typography variant="h5" sx={{ color: '#FFC107', mb: 2 }}>No budget data available</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Budget analysis will appear once jobs with budget information are available.
        </Typography>
      </Box>
    )
  }

  // Calculate insights
  const totalProjects = rangeCounts.reduce((sum, r) => sum + r.count, 0)
  const avgProjectValue = totalProjects > 0 
    ? Math.round(rangeCounts.reduce((sum, r) => sum + (r.avgBudget * r.count), 0) / totalProjects)
    : 0

  const option = {
    backgroundColor: '#0a0e1a',
    title: {
      text: 'Project Budget Landscape',
      subtext: `Analysis of ${totalProjects} projects • Avg Value: $${avgProjectValue.toLocaleString()}`,
      left: 'center',
      top: '3%',
      textStyle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff'
      },
      subtextStyle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 16,
        fontWeight: '500'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(255, 193, 7, 0.1)'
        }
      },
      backgroundColor: 'rgba(15, 15, 35, 0.95)',
      borderColor: 'rgba(255, 193, 7, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff',
        fontSize: 14
      },
      formatter: function(params: any) {
        const data = params.data
        const rangeInfo = rangeCounts[params.dataIndex]
        return `
          <div style="padding: 18px; border-radius: 8px; background: linear-gradient(135deg, ${rangeInfo.color}20, ${rangeInfo.color}08);">
            <div style="text-align: center; margin-bottom: 12px;">
              <span style="font-size: 16px; color: ${rangeInfo.color}; font-weight: 700;">${rangeInfo.name}</span>
            </div>
            <div style="margin: 10px 0;">
              <span style="color: #4ECDC4;">Projects:</span> <span style="color: #ffffff; font-weight: bold;">${rangeInfo.count}</span>
            </div>
            <div style="margin: 10px 0;">
              <span style="color: #FF6B6B;">Market Share:</span> <span style="color: #ffffff; font-weight: bold;">${rangeInfo.percentage.toFixed(1)}%</span>
            </div>
            <div style="margin: 10px 0;">
              <span style="color: #A29BFE;">Avg Budget:</span> <span style="color: #ffffff; font-weight: bold;">$${rangeInfo.avgBudget.toLocaleString()}</span>
            </div>
            <div style="margin: 10px 0; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #FFC107; font-style: italic;">${rangeInfo.description}</span>
            </div>
          </div>
        `
      }
    },
    grid: {
      left: '30%',
      right: '5%',
      bottom: '12%',
      top: '20%',
      containLabel: false
    },
    xAxis: {
      type: 'value',
      min: 0,
      name: 'Number of Projects',
      nameLocation: 'middle',
      nameGap: 35,
      nameTextStyle: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold'
      },
      axisLabel: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '500'
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 1
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: rangeCounts.map(range => range.name),
      axisLabel: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: 'bold',
        margin: 15,
        align: 'right',
        lineHeight: 14
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 1
        }
      },
      axisTick: {
        show: false
      }
    },
    series: [
      {
        name: 'Project Distribution',
        type: 'bar',
        data: rangeCounts.map((range, index) => ({
          value: range.count,
          name: range.name,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                {
                  offset: 0,
                  color: range.color
                },
                {
                  offset: 0.6,
                  color: range.color + 'DD'
                },
                {
                  offset: 1,
                  color: range.color + '77'
                }
              ]
            },
            borderRadius: [0, 12, 12, 0]
          }
        })),
        emphasis: {
          itemStyle: {
            scale: 1.05
          }
        },
        label: {
          show: true,
          position: 'right',
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 'bold',
          formatter: function(params: any) {
            const rangeInfo = rangeCounts[params.dataIndex]
            return `${params.value} (${rangeInfo.percentage.toFixed(1)}%)`
          }
        },
        barMaxWidth: 35
      }
    ],
    animation: true,
    animationDuration: 2000,
    animationEasing: 'elasticOut',
    animationDelay: function (idx: number) {
      return idx * 150
    }
  }

  return (
    <div style={{ 
      textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(60, 30, 90, 0.8) 100%)',
      borderRadius: '16px',
      padding: '24px',
      margin: '16px 0',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 20px 40px rgba(155, 89, 182, 0.2)'
    }}>
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mb: 2 }}>
        <Button size="small" variant={budgetMode === 'all' ? 'contained' : 'outlined'} onClick={() => setBudgetMode('all')}>All</Button>
        <Button size="small" variant={budgetMode === 'fixed' ? 'contained' : 'outlined'} onClick={() => setBudgetMode('fixed')}>Fixed Price</Button>
        <Button size="small" variant={budgetMode === 'hourly' ? 'contained' : 'outlined'} onClick={() => setBudgetMode('hourly')}>Hourly</Button>
      </Stack>
      <ReactECharts 
        option={option} 
        style={{ height: '800px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
      
      <div style={{ 
        maxWidth: '900px', 
        margin: '24px auto 0', 
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <h4 style={{ 
          color: '#9B59B6', 
          marginBottom: '12px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          Strategic Rate Intelligence
        </h4>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          lineHeight: '1.7',
          fontSize: '14px',
          margin: 0
        }}>
          This comprehensive rate analysis reveals market positioning opportunities across all skill tiers. 
          Each segment represents a distinct market category with unique characteristics and competition levels. 
          Position your pricing strategically within your expertise tier, target underserved premium segments, 
          and understand competitive density to maximize your earning potential while maintaining market competitiveness.
        </p>
      </div>
    </div>
  )
} 