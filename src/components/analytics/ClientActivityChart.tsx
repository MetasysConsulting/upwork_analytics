'use client'

import ReactECharts from 'echarts-for-react'
import { useState, useEffect } from 'react'
import { CircularProgress, Box, Typography } from '@mui/material'

interface ClientActivityChartProps {
  fromDate?: string
}

interface ClientActivityPoint {
  jobs_posted: number
  total_spent: number
  location: string
}

export default function ClientActivityChart({ fromDate }: ClientActivityChartProps) {
  const [activityData, setActivityData] = useState<ClientActivityPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true)
        const query = fromDate ? `?from_date=${encodeURIComponent(fromDate)}` : ''
        const response = await fetch(`/api/metrics/client-activity-scatter${query}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load data')
        }

        const data = (result.data || []).map((item: any) => ({
          jobs_posted: Number(item.jobs_posted || 0),
          total_spent: Number(item.total_spent || 0),
          location: item.location || 'Unknown'
        }))

        setActivityData(data)
      } catch (err: any) {
        console.error('Error fetching client activity data:', err)
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [fromDate])

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

  if (activityData.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px',
        background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(220, 38, 127, 0.3) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ffffff'
      }}>
        <h3 style={{ color: '#EC4899' }}>No client activity data available</h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '16px' }}>
          Jobs need to have both client_jobs_posted and client_total_spent data to display activity.
        </p>
      </div>
    )
  }

  // Categorize clients by activity level
  const maxJobs = Math.max(...activityData.map(item => item.jobs_posted))
  const maxSpent = Math.max(...activityData.map(item => item.total_spent))

  const categorizedData = activityData.map(item => {
    let category = ''
    let color = ''
    let size = 20

    // Determine category based on jobs posted and spending
    if (item.jobs_posted >= maxJobs * 0.7 && item.total_spent >= maxSpent * 0.7) {
      category = 'High Volume & High Spend'
      color = '#DC2626'
      size = 35
    } else if (item.jobs_posted >= maxJobs * 0.5 || item.total_spent >= maxSpent * 0.5) {
      category = 'Active Clients'
      color = '#F59E0B'
      size = 30
    } else if (item.jobs_posted >= maxJobs * 0.3 || item.total_spent >= maxSpent * 0.3) {
      category = 'Moderate Activity'
      color = '#10B981'
      size = 25
    } else {
      category = 'Low Activity'
      color = '#6B7280'
      size = 20
    }

    return {
      ...item,
      category,
      color,
      size
    }
  })

  const option = {
    backgroundColor: '#0a0e1a',
    title: {
      text: 'Client Activity Landscape',
      subtext: `${activityData.length} data points — Jobs Posted vs. Total Spending`,
      left: 'center',
      top: '3%',
      textStyle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        textShadowColor: 'rgba(236, 72, 153, 0.6)',
        textShadowBlur: 15
      },
      subtextStyle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 16,
        fontWeight: '500'
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 15, 35, 0.95)',
      borderColor: 'rgba(236, 72, 153, 0.3)',
      borderWidth: 2,
      textStyle: {
        color: '#ffffff',
        fontSize: 14
      },
      formatter: function(params: any) {
        const data = params.data
        return `
          <div style="padding: 15px; border-radius: 12px; background: linear-gradient(135deg, ${data.color}30, ${data.color}15);">
            <div style="text-align: center; margin-bottom: 10px;">
              <span style="font-size: 24px; color: ${data.color};">●</span>
            </div>
            <strong style="color: ${data.color}; font-size: 16px; display: block; margin-bottom: 10px;">${data.category}</strong>
            <div style="margin: 8px 0;">
              <span style="color: #4ECDC4;">📊 Jobs Posted:</span> <span style="color: #ffffff; font-weight: bold;">${data.jobs_posted}</span>
            </div>
            <div style="margin: 8px 0;">
              <span style="color: #FF6B6B;">💰 Total Spent:</span> <span style="color: #ffffff; font-weight: bold;">$${data.total_spent.toLocaleString()}</span>
            </div>
            <div style="margin: 8px 0;">
              <span style="color: #A29BFE;">📍 Location:</span> <span style="color: #ffffff; font-weight: bold;">${data.location}</span>
            </div>
          </div>
        `
      }
    },
    legend: {
      orient: 'vertical',
      left: '2%',
      top: '20%',
      textStyle: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold'
      },
      data: ['High Volume & High Spend', 'Active Clients', 'Moderate Activity', 'Low Activity']
    },
    grid: {
      left: '15%',
      right: '8%',
      bottom: '15%',
      top: '18%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: 'Jobs Posted',
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
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 2
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
      type: 'value',
      name: 'Total Spending ($)',
      nameLocation: 'middle',
      nameGap: 60,
      nameTextStyle: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold'
      },
      axisLabel: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '500',
        formatter: function(value: number) {
          return value >= 1000 ? `$${(value/1000).toFixed(0)}K` : `$${value}`
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 2
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: 'Client Activity',
        type: 'scatter',
        data: categorizedData.map(item => ({
          value: [item.jobs_posted, item.total_spent],
          symbolSize: item.size,
          itemStyle: {
            color: {
              type: 'radial',
              x: 0.4,
              y: 0.3,
              r: 0.7,
              colorStops: [
                {
                  offset: 0,
                  color: item.color
                },
                {
                  offset: 1,
                  color: item.color + '60'
                }
              ]
            },
            borderColor: item.color,
            borderWidth: 2,
            shadowColor: item.color,
            shadowBlur: 15,
            shadowOffsetY: 3
          },
          ...item
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 25,
            shadowOffsetY: 6,
            scale: 1.2
          }
        }
      }
    ],
    animation: true,
    animationDuration: 2000,
    animationEasing: 'elasticOut',
    animationDelay: function (idx: number) {
      return idx * 20
    }
  }

  return (
    <div style={{ 
      textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(220, 38, 127, 0.2) 50%, rgba(139, 92, 246, 0.2) 100%)',
      borderRadius: '16px',
      padding: '24px',
      margin: '16px 0',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 20px 40px rgba(220, 38, 127, 0.3)'
    }}>
      <ReactECharts 
        option={option} 
        style={{ height: '700px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
      
      <div style={{ 
        maxWidth: '900px', 
        margin: '24px auto 0', 
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(220, 38, 127, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <h4 style={{ 
          color: '#EC4899', 
          marginBottom: '12px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          Activity Intelligence
        </h4>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          lineHeight: '1.7',
          fontSize: '14px',
          margin: 0
        }}>
          This scatter plot reveals the relationship between client job posting frequency and spending patterns. 
          Larger, brighter dots represent high-value clients with significant activity. Target the upper-right 
          quadrant for maximum opportunity potential, while identifying emerging patterns in client behavior.
        </p>
      </div>
    </div>
  )
} 