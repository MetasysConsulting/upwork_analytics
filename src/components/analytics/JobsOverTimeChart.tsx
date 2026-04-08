'use client'

import ReactECharts from 'echarts-for-react'
import { useState, useEffect } from 'react'
import { CircularProgress, Box, Typography } from '@mui/material'

interface JobsOverTimeChartProps {
  jobs?: any[]
  fromDate?: string
}

interface TimeSeriesData {
  date: string | Date
  count: number
}

export default function JobsOverTimeChart({ fromDate }: JobsOverTimeChartProps) {
  const [timelineData, setTimelineData] = useState<TimeSeriesData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true)
        const query = fromDate ? `?from_date=${encodeURIComponent(fromDate)}` : ''
        const response = await fetch(`/api/metrics/jobs-over-time${query}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch metrics')
        }

        const data = result.data || []
        // Transform the data - date comes as string from API
        const transformed = data
          .map((item: any) => ({
            date: item.date, // Keep as string for now
            count: Number(item.job_count)
          }))
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

        setTimelineData(transformed)
      } catch (err: any) {
        console.error('Error fetching jobs over time:', err)
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

  if (timelineData.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px',
        background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(30, 60, 90, 0.8) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ffffff'
      }}>
        <h3 style={{ color: '#4ECDC4' }}>No timeline data available</h3>
      </div>
    )
  }

  // Prepare data for ECharts
  const dates = timelineData.map(item => {
    // Handle both Date objects and date strings
    const dateStr = typeof item.date === 'string' ? item.date : item.date.toISOString()
    return dateStr.split('T')[0]
  })
  const counts = timelineData.map(item => item.count)
  const maxJobs = Math.max(...counts)
  const totalJobs = counts.reduce((sum, count) => sum + count, 0)

  const option = {
    backgroundColor: '#0a0e1a',
    title: {
      text: '📈 Jobs Posted Over Time',
      subtext: `Temporal analysis of ${totalJobs} job postings across ${timelineData.length} days`,
      left: 'center',
      top: '3%',
      textStyle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        textShadowColor: 'rgba(59, 130, 246, 0.5)',
        textShadowBlur: 15
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
        type: 'cross',
        crossStyle: {
          color: 'rgba(255, 255, 255, 0.5)'
        },
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 2,
          type: 'dashed'
        }
      },
      backgroundColor: 'rgba(15, 15, 35, 0.95)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      borderWidth: 2,
      textStyle: {
        color: '#ffffff',
        fontSize: 14
      },
      formatter: function(params: any) {
        const data = params[0]
        const date = new Date(data.name)
        const formattedDate = date.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
        return `
          <div style="padding: 15px; border-radius: 12px; background: linear-gradient(135deg, #3B82F620, #4ECDC410);">
            <div style="text-align: center; margin-bottom: 10px;">
              <span style="font-size: 24px;">📅</span>
            </div>
            <strong style="color: #4ECDC4; font-size: 16px; display: block; margin-bottom: 8px;">${formattedDate}</strong>
            <div style="margin: 8px 0;">
              <span style="color: #3B82F6;">📊 Jobs Posted:</span> <span style="color: #ffffff; font-weight: bold;">${data.value}</span>
            </div>
            <div style="margin: 8px 0;">
              <span style="color: #FF6B6B;">📈 Daily Impact:</span> <span style="color: #ffffff; font-weight: bold;">${((data.value / totalJobs) * 100).toFixed(1)}% of total</span>
            </div>
            <div style="margin: 8px 0;">
              <span style="color: #A29BFE;">⚡ Activity Level:</span> <span style="color: #ffffff; font-weight: bold;">${data.value >= maxJobs * 0.8 ? 'Peak' : data.value >= maxJobs * 0.5 ? 'High' : data.value >= maxJobs * 0.3 ? 'Medium' : 'Low'}</span>
            </div>
          </div>
        `
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '500',
        rotate: 45,
        formatter: function(value: string) {
          const date = new Date(value)
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 2
        }
      },
      axisTick: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: 'Jobs Posted',
      nameLocation: 'middle',
      nameGap: 50,
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
    series: [
      {
        name: 'Jobs Posted',
        type: 'line',
        data: counts,
        smooth: 0.3,
        lineStyle: {
          color: '#3B82F6',
          width: 4,
          shadowColor: 'rgba(59, 130, 246, 0.5)',
          shadowBlur: 10,
          shadowOffsetY: 3
        },
        itemStyle: {
          color: '#3B82F6',
          borderColor: '#ffffff',
          borderWidth: 3,
          shadowColor: 'rgba(59, 130, 246, 0.8)',
          shadowBlur: 15,
          shadowOffsetY: 5
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(59, 130, 246, 0.6)'
              },
              {
                offset: 0.5,
                color: 'rgba(59, 130, 246, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(59, 130, 246, 0.05)'
              }
            ]
          }
        },
        emphasis: {
          itemStyle: {
            color: '#60A5FA',
            borderColor: '#ffffff',
            borderWidth: 4,
            shadowColor: 'rgba(96, 165, 250, 0.8)',
            shadowBlur: 20,
            shadowOffsetY: 8,
            scale: 1.2
          },
          lineStyle: {
            width: 6
          }
        },
        markPoint: {
          data: [
            {
              type: 'max',
              name: 'Peak Activity',
              itemStyle: {
                color: '#4ECDC4'
              },
              label: {
                color: '#ffffff',
                fontWeight: 'bold'
              }
            }
          ],
          symbolSize: 60,
          itemStyle: {
            shadowColor: 'rgba(78, 205, 196, 0.8)',
            shadowBlur: 15
          }
        },
        markLine: {
          data: [
            {
              type: 'average',
              name: 'Average',
              lineStyle: {
                color: '#FF6B6B',
                width: 2,
                type: 'dashed'
              },
              label: {
                color: '#FF6B6B',
                fontWeight: 'bold'
              }
            }
          ]
        }
      }
    ],
    animation: true,
    animationDuration: 2500,
    animationEasing: 'cubicOut',
    animationDelay: function (idx: number) {
      return idx * 10
    }
  }

  return (
    <div style={{ 
      textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(30, 60, 90, 0.8) 100%)',
      borderRadius: '16px',
      padding: '24px',
      margin: '16px 0',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)'
    }}>
      <ReactECharts 
        option={option} 
        style={{ height: '700px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
      
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginTop: '24px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{ 
          flex: 1,
          minWidth: '300px',
          padding: '20px',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <h4 style={{ 
            color: '#3B82F6', 
            marginBottom: '12px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            📊 Posting Insights
          </h4>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            lineHeight: '1.6',
            fontSize: '13px',
            margin: 0
          }}>
            Track temporal posting patterns to identify peak hiring periods and market activity cycles. 
            Time your job searches during high-activity periods for maximum opportunity exposure.
          </p>
        </div>
        
        <div style={{ 
          flex: 1,
          minWidth: '300px',
          padding: '20px',
          background: 'rgba(78, 205, 196, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(78, 205, 196, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <h4 style={{ 
            color: '#4ECDC4', 
            marginBottom: '12px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            🎯 Strategic Timing
          </h4>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            lineHeight: '1.6',
            fontSize: '13px',
            margin: 0
          }}>
            Understand seasonal trends, weekly patterns, and optimal application timing to gain 
            competitive advantage in the marketplace and improve proposal success rates.
          </p>
        </div>
      </div>
    </div>
  )
} 