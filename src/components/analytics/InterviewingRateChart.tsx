'use client'

import ReactECharts from 'echarts-for-react'
import { useState, useEffect } from 'react'
import { CircularProgress, Box, Typography } from '@mui/material'

interface InterviewingRateChartProps {
  fromDate?: string
}

interface InterviewRow {
  range_label: string
  job_count: number
}

export default function InterviewingRateChart({ fromDate }: InterviewingRateChartProps) {
  const [rows, setRows] = useState<InterviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true)
        const query = fromDate ? `?from_date=${encodeURIComponent(fromDate)}` : ''
        const response = await fetch(`/api/metrics/interview-rate${query}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load data')
        }

        setRows(result.data || [])
      } catch (err: any) {
        console.error('Error fetching interviewing data:', err)
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

  if (rows.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px',
        background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(16, 185, 129, 0.3) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ffffff'
      }}>
        <h3 style={{ color: '#10B981' }}>No interviewing data available</h3>
      </div>
    )
  }

  const rangeStyle: Record<string, { color: string; icon: string }> = {
    'No Interviews (0)': { color: '#6B7280', icon: '😴' },
    'Low Activity (1-3)': { color: '#10B981', icon: '📝' },
    'Moderate (4-8)': { color: '#3B82F6', icon: '💼' },
    'High Activity (9-15)': { color: '#F59E0B', icon: '🔥' },
    'Very Active (16+)': { color: '#EF4444', icon: '🚀' }
  }

  const totalJobs = rows.reduce((sum, row) => sum + Number(row.job_count || 0), 0)
  const rangeCounts = rows.map((row) => ({
    name: row.range_label,
    count: Number(row.job_count || 0),
    percentage: totalJobs > 0 ? (Number(row.job_count || 0) / totalJobs) * 100 : 0,
    color: rangeStyle[row.range_label]?.color || '#10B981',
    icon: rangeStyle[row.range_label]?.icon || '🎯'
  }))

  const option = {
    backgroundColor: '#0a0e1a',
    title: {
      text: '🎯 Interview Activity Analysis',
      subtext: `Competition analysis from ${totalJobs} jobs with interview data`,
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
          color: 'rgba(16, 185, 129, 0.1)'
        }
      },
      backgroundColor: 'rgba(15, 15, 35, 0.95)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff',
        fontSize: 14
      },
      formatter: function(params: any) {
        const data = params.data
        const percentage = totalJobs > 0 ? ((data.value / totalJobs) * 100).toFixed(1) : '0.0'
        return `
          <div style="padding: 15px; border-radius: 8px; background: linear-gradient(135deg, ${data.itemStyle.color}15, ${data.itemStyle.color}05);">
            <div style="text-align: center; margin-bottom: 10px;">
              <span style="font-size: 24px;">${data.icon}</span>
            </div>
            <strong style="color: ${data.itemStyle.color}; font-size: 16px; display: block; margin-bottom: 10px;">${data.name}</strong>
            <div style="margin: 8px 0;">
              <span style="color: #4ECDC4;">💼 Jobs:</span> <span style="color: #ffffff; font-weight: bold;">${data.value}</span>
            </div>
            <div style="margin: 8px 0;">
              <span style="color: #FF6B6B;">📊 Market Share:</span> <span style="color: #ffffff; font-weight: bold;">${percentage}%</span>
            </div>
          </div>
        `
      }
    },
    grid: {
      left: '25%',
      right: '8%',
      bottom: '10%',
      top: '18%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: 'Number of Jobs',
      nameLocation: 'middle',
      nameGap: 30,
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
          color: 'rgba(255, 255, 255, 0.2)',
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
      data: rangeCounts.map(range => range.name.split(' (')[0]),
      axisLabel: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: 'bold',
        width: 120,
        overflow: 'truncate'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)',
          width: 1
        }
      },
      axisTick: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      }
    },
    series: [
      {
        name: 'Interview Activity',
        type: 'bar',
        data: rangeCounts.map((range, index) => ({
          value: range.count,
          name: range.name,
          icon: range.icon,
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
                  offset: 0.4,
                  color: range.color + 'DD'
                },
                {
                  offset: 1,
                  color: range.color + '66'
                }
              ]
            },
            borderRadius: [0, 8, 8, 0]
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
            const percentage = totalJobs > 0 ? ((params.value / totalJobs) * 100).toFixed(1) : '0.0'
            return `${params.value} (${percentage}%)`
          }
        },
        barMaxWidth: 30
      }
    ],
    animation: true,
    animationDuration: 1900,
    animationEasing: 'elasticOut',
    animationDelay: function (idx: number) {
      return idx * 160
    }
  }

  return (
    <div style={{ 
      textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(16, 185, 129, 0.2) 50%, rgba(59, 130, 246, 0.2) 100%)',
      borderRadius: '16px',
      padding: '24px',
      margin: '16px 0',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)'
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
        border: '1px solid rgba(16, 185, 129, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <h4 style={{ 
          color: '#10B981', 
          marginBottom: '12px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          🎯 Competition Intelligence
        </h4>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          lineHeight: '1.7',
          fontSize: '14px',
          margin: 0
        }}>
          This analysis reveals interview activity patterns across different competition levels. 
          Lower interview counts often indicate less competition and better proposal success rates, 
          while higher activity suggests premium opportunities with intense competition.
        </p>
      </div>
    </div>
  )
} 