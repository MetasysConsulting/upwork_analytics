'use client'

import ReactECharts from 'echarts-for-react'
import { useState, useEffect } from 'react'
import { CircularProgress, Box, Typography } from '@mui/material'

interface ClientHireRateChartProps {
  jobs?: any[]
  fromDate?: string
}

interface HireRateRow {
  range_label: string
  client_count: number
  avg_rate: number
}

export default function ClientHireRateChart({ fromDate }: ClientHireRateChartProps) {
  const [rows, setRows] = useState<HireRateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true)
        const query = fromDate ? `?from_date=${encodeURIComponent(fromDate)}` : ''
        const response = await fetch(`/api/metrics/client-hire-rate${query}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load data')
        }

        setRows(result.data || [])
      } catch (err: any) {
        console.error('Error fetching hire rate data:', err)
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
        background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(139, 92, 246, 0.3) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ffffff'
      }}>
        <h3 style={{ color: '#8B5CF6' }}>No hire rate data available</h3>
      </div>
    )
  }

  const rangeStyle: Record<string, { color: string; icon: string }> = {
    'Very Low (0-20%)': { color: '#EF4444', icon: '🔻' },
    'Low (20-40%)': { color: '#F59E0B', icon: '📉' },
    'Medium (40-60%)': { color: '#10B981', icon: '📊' },
    'High (60-80%)': { color: '#3B82F6', icon: '📈' },
    'Excellent (80%+)': { color: '#8B5CF6', icon: '🏆' }
  }

  const totalClients = rows.reduce((sum, row) => sum + Number(row.client_count || 0), 0)
  const rangeCounts = rows.map((row) => ({
    name: row.range_label,
    count: Number(row.client_count || 0),
    percentage: totalClients > 0 ? (Number(row.client_count || 0) / totalClients) * 100 : 0,
    avgRate: Number(row.avg_rate || 0),
    color: rangeStyle[row.range_label]?.color || '#8B5CF6',
    icon: rangeStyle[row.range_label]?.icon || '📊'
  }))

  if (rangeCounts.length === 0) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        padding: '60px',
        background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(139, 92, 246, 0.3) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ffffff'
      }}>
        <Typography variant="h5" sx={{ color: '#8B5CF6', mb: 2 }}>No hire rate data available</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Hire rate analysis will appear once jobs with client hire rate information are available.
        </Typography>
      </Box>
    )
  }

  const option = {
    backgroundColor: '#0a0e1a',
    title: {
      text: '📊 Client Hire Rate Analysis',
      subtext: `Success rate analysis from ${totalClients} clients with hire rate data`,
      left: 'center',
      top: '3%',
      textStyle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        textShadowColor: 'rgba(139, 92, 246, 0.6)',
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
          color: 'rgba(139, 92, 246, 0.5)'
        }
      },
      backgroundColor: 'rgba(15, 15, 35, 0.95)',
      borderColor: 'rgba(139, 92, 246, 0.3)',
      borderWidth: 2,
      textStyle: {
        color: '#ffffff',
        fontSize: 14
      },
      formatter: function(params: any) {
        const data = params[0]
        const rangeInfo = rangeCounts[data.dataIndex]
        return `
          <div style="padding: 15px; border-radius: 12px; background: linear-gradient(135deg, ${rangeInfo.color}30, ${rangeInfo.color}15);">
            <div style="text-align: center; margin-bottom: 10px;">
              <span style="font-size: 28px;">${rangeInfo.icon}</span>
            </div>
            <strong style="color: ${rangeInfo.color}; font-size: 18px; display: block; margin-bottom: 10px;">${rangeInfo.name}</strong>
            <div style="margin: 8px 0;">
              <span style="color: #4ECDC4;">👥 Clients:</span> <span style="color: #ffffff; font-weight: bold;">${rangeInfo.count}</span>
            </div>
            <div style="margin: 8px 0;">
              <span style="color: #FF6B6B;">📊 Distribution:</span> <span style="color: #ffffff; font-weight: bold;">${rangeInfo.percentage.toFixed(1)}%</span>
            </div>
            <div style="margin: 8px 0;">
              <span style="color: #A29BFE;">⭐ Avg Rate:</span> <span style="color: #ffffff; font-weight: bold;">${rangeInfo.avgRate.toFixed(1)}%</span>
            </div>
          </div>
        `
      }
    },
    grid: {
      left: '8%',
      right: '8%',
      bottom: '15%',
      top: '18%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: rangeCounts.map(range => `${range.icon} ${range.name.split(' (')[0]}`),
      axisLabel: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: 'bold',
        rotate: 15,
        margin: 15
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
      name: 'Number of Clients',
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
        name: 'Client Hire Rates',
        type: 'line',
        data: rangeCounts.map(range => range.count),
        smooth: 0.3,
        lineStyle: {
          color: '#8B5CF6',
          width: 4,
          shadowColor: 'rgba(139, 92, 246, 0.5)',
          shadowBlur: 10,
          shadowOffsetY: 3
        },
        itemStyle: {
          color: '#8B5CF6',
          borderColor: '#ffffff',
          borderWidth: 3,
          shadowColor: 'rgba(139, 92, 246, 0.8)',
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
                color: 'rgba(139, 92, 246, 0.6)'
              },
              {
                offset: 0.5,
                color: 'rgba(139, 92, 246, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(139, 92, 246, 0.05)'
              }
            ]
          }
        },
        emphasis: {
          itemStyle: {
            color: '#A78BFA',
            borderColor: '#ffffff',
            borderWidth: 4,
            shadowColor: 'rgba(167, 139, 250, 0.8)',
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
              name: 'Peak Success',
              itemStyle: {
                color: '#10B981'
              },
              label: {
                color: '#ffffff',
                fontWeight: 'bold'
              }
            }
          ],
          symbolSize: 60,
          itemStyle: {
            shadowColor: 'rgba(16, 185, 129, 0.8)',
            shadowBlur: 15
          }
        },
        markLine: {
          data: [
            {
              type: 'average',
              name: 'Average',
              lineStyle: {
                color: '#F59E0B',
                width: 2,
                type: 'dashed'
              },
              label: {
                color: '#F59E0B',
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
      return idx * 15
    }
  }

  return (
    <div style={{ 
      textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(59, 130, 246, 0.2) 100%)',
      borderRadius: '16px',
      padding: '24px',
      margin: '16px 0',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)'
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
        border: '1px solid rgba(139, 92, 246, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <h4 style={{ 
          color: '#8B5CF6', 
          marginBottom: '12px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          🎯 Success Rate Intelligence
        </h4>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          lineHeight: '1.7',
          fontSize: '14px',
          margin: 0
        }}>
          This analysis reveals client hiring patterns and success rates across different performance tiers. 
          Target clients with higher hire rates for better conversion probability, while understanding 
          that lower rates may indicate either more selective clients or opportunities for improvement.
        </p>
      </div>
    </div>
  )
} 