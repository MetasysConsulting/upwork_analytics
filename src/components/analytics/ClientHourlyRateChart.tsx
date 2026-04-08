'use client'

import ReactECharts from 'echarts-for-react'
import { useState, useEffect } from 'react'
import { CircularProgress, Box, Typography } from '@mui/material'

interface ClientHourlyRateChartProps {
  jobs?: any[]
  fromDate?: string
}

interface HourlyRateRow {
  range_label: string
  job_count: number
  avg_rate: number
}

export default function ClientHourlyRateChart({ fromDate }: ClientHourlyRateChartProps) {
  const [rows, setRows] = useState<HourlyRateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true)
        const query = fromDate ? `?from_date=${encodeURIComponent(fromDate)}` : ''
        const response = await fetch(`/api/metrics/client-hourly-rate${query}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load data')
        }

        setRows(result.data || [])
      } catch (err: any) {
        console.error('Error fetching hourly rate data:', err)
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
        background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(6, 182, 212, 0.3) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ffffff'
      }}>
        <h3 style={{ color: '#06B6D4' }}>No hourly rate data available</h3>
      </div>
    )
  }

  const rangeStyle: Record<string, { color: string; icon: string }> = {
    '$5-$15': { color: '#FF6B6B', icon: '💰' },
    '$15-$25': { color: '#FFB347', icon: '🌱' },
    '$25-$35': { color: '#4ECDC4', icon: '⚡' },
    '$35-$50': { color: '#45B7D1', icon: '🎯' },
    '$50-$75': { color: '#9B59B6', icon: '💎' },
    '$75+': { color: '#E67E22', icon: '👑' }
  }

  const totalJobs = rows.reduce((sum, row) => sum + Number(row.job_count || 0), 0)
  const weightedSum = rows.reduce((sum, row) => sum + (Number(row.avg_rate || 0) * Number(row.job_count || 0)), 0)
  const avgRate = totalJobs > 0 ? weightedSum / totalJobs : 0
  const rangeCounts = rows.map((row) => ({
    label: row.range_label,
    count: Number(row.job_count || 0),
    percentage: totalJobs > 0 ? (Number(row.job_count || 0) / totalJobs) * 100 : 0,
    color: rangeStyle[row.range_label]?.color || '#06B6D4',
    icon: rangeStyle[row.range_label]?.icon || '💼'
  }))

  const option = {
    backgroundColor: '#0a0e1a',
    title: {
      text: '💰 Hourly Rate Market Analysis',
      subtext: `Competitive rate distribution from ${totalJobs} hourly jobs • Average: $${avgRate.toFixed(0)}/hr`,
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
          color: 'rgba(6, 182, 212, 0.1)'
        }
      },
      backgroundColor: 'rgba(15, 15, 35, 0.95)',
      borderColor: 'rgba(6, 182, 212, 0.3)',
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
              <span style="color: #4ECDC4;">📊 Jobs:</span> <span style="color: #ffffff; font-weight: bold;">${data.value}</span>
            </div>
            <div style="margin: 8px 0;">
              <span style="color: #FF6B6B;">📈 Market Share:</span> <span style="color: #ffffff; font-weight: bold;">${percentage}%</span>
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
      data: rangeCounts.map(range => range.label),
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
        name: 'Rate Distribution',
        type: 'bar',
        data: rangeCounts.map((range, index) => ({
          value: range.count,
          name: range.label,
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
                  offset: 0.6,
                  color: range.color + 'DD'
                },
                {
                  offset: 1,
                  color: range.color + '88'
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
    animationDuration: 2000,
    animationEasing: 'bounceOut',
    animationDelay: function (idx: number) {
      return idx * 200
    }
  }

  return (
    <div style={{ 
      textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(6, 182, 212, 0.2) 50%, rgba(255, 159, 67, 0.2) 100%)',
      borderRadius: '16px',
      padding: '24px',
      margin: '16px 0',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 20px rgba(6, 182, 212, 0.15)'
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
        border: '1px solid rgba(6, 182, 212, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <h4 style={{ 
          color: '#06B6D4', 
          marginBottom: '12px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          🎯 Rate Strategy Intelligence
        </h4>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          lineHeight: '1.7',
          fontSize: '14px',
          margin: 0
        }}>
          This comprehensive rate analysis reveals market positioning opportunities across all hourly 
          price segments. Use these insights to strategically position your rates, identify underserved 
          premium segments, and understand competitive density at each pricing tier for maximum market penetration.
        </p>
      </div>
    </div>
  )
} 