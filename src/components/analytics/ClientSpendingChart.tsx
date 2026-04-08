'use client'

import ReactECharts from 'echarts-for-react'
import { useState, useEffect } from 'react'
import { CircularProgress, Box, Typography } from '@mui/material'

interface ClientSpendingChartProps {
  fromDate?: string
}

interface ClientSpendingData {
  tier_label: string
  client_count: number
}

export default function ClientSpendingChart({ fromDate }: ClientSpendingChartProps) {
  const [spendingRows, setSpendingRows] = useState<ClientSpendingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true)
        const query = fromDate ? `?from_date=${encodeURIComponent(fromDate)}` : ''
        const response = await fetch(`/api/metrics/client-spending${query}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load data')
        }

        setSpendingRows(result.data || [])
      } catch (err: any) {
        console.error('Error fetching client spending data:', err)
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

  if (spendingRows.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px',
        background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(162, 155, 254, 0.3) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ffffff'
      }}>
        <h3 style={{ color: '#A29BFE' }}>No client spending data available</h3>
      </div>
    )
  }

  const spendingStyle: Record<string, { color: string; icon: string }> = {
    'Starter ($1-$1K)': { color: '#FF6B6B', icon: '🌱' },
    'Growing ($1K-$5K)': { color: '#4ECDC4', icon: '📈' },
    'Established ($5K-$25K)': { color: '#45B7D1', icon: '🏢' },
    'Corporate ($25K-$100K)': { color: '#A29BFE', icon: '🏛️' },
    'Enterprise ($100K+)': { color: '#FF9F43', icon: '👑' }
  }

  const totalClients = spendingRows.reduce((sum, r) => sum + Number(r.client_count || 0), 0)
  const tierCounts = spendingRows.map((row) => ({
    name: row.tier_label,
    count: Number(row.client_count || 0),
    percentage: totalClients > 0 ? (Number(row.client_count || 0) / totalClients) * 100 : 0,
    color: spendingStyle[row.tier_label]?.color || '#A29BFE',
    icon: spendingStyle[row.tier_label]?.icon || '💼'
  }))

  const option = {
    backgroundColor: '#0a0e1a',
    title: {
      text: '💰 Client Spending Distribution',
      subtext: `Investment analysis of ${totalClients} clients across ${tierCounts.length} spending tiers`,
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
          color: 'rgba(162, 155, 254, 0.1)'
        }
      },
      backgroundColor: 'rgba(15, 15, 35, 0.95)',
      borderColor: 'rgba(162, 155, 254, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff',
        fontSize: 14
      },
      formatter: function(params: any) {
        const data = params.data
        const percentage = ((data.value / totalClients) * 100).toFixed(1)
        return `
          <div style="padding: 15px; border-radius: 8px; background: linear-gradient(135deg, ${data.itemStyle.color}15, ${data.itemStyle.color}05);">
            <div style="text-align: center; margin-bottom: 10px;">
              <span style="font-size: 24px;">${data.icon}</span>
            </div>
            <strong style="color: ${data.itemStyle.color}; font-size: 16px; display: block; margin-bottom: 10px;">${data.name}</strong>
            <div style="margin: 8px 0;">
              <span style="color: #4ECDC4;">👥 Clients:</span> <span style="color: #ffffff; font-weight: bold;">${data.value}</span>
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
      name: 'Number of Clients',
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
      data: tierCounts.map(tier => {
        const [name, rangeText] = tier.name.split(' (');
        return `${tier.icon} ${name}\n(${rangeText}`;
      }),
      axisLabel: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: 'bold',
        margin: 15,
        align: 'right',
        lineHeight: 14
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)',
          width: 1
        }
      },
      axisTick: {
        show: false
      }
    },
    series: [
      {
        name: 'Client Distribution',
        type: 'bar',
        data: tierCounts.map((tier, index) => ({
          value: tier.count,
          name: tier.name,
          icon: tier.icon,
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
                  color: tier.color
                },
                {
                  offset: 0.5,
                  color: tier.color + 'CC'
                },
                {
                  offset: 1,
                  color: tier.color + '88'
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
            const percentage = ((params.value / totalClients) * 100).toFixed(1)
            return `${params.value} (${percentage}%)`
          }
        },
        barMaxWidth: 30
      }
    ],
    animation: true,
    animationDuration: 1800,
    animationEasing: 'elasticOut',
    animationDelay: function (idx: number) {
      return idx * 150
    }
  }

  return (
    <div style={{ 
      textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(162, 155, 254, 0.2) 50%, rgba(255, 107, 107, 0.2) 100%)',
      borderRadius: '16px',
      padding: '24px',
      margin: '16px 0',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 20px rgba(162, 155, 254, 0.15)'
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
        border: '1px solid rgba(162, 155, 254, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <h4 style={{ 
          color: '#A29BFE', 
          marginBottom: '12px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          🎯 Spending Intelligence
        </h4>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          lineHeight: '1.7',
          fontSize: '14px',
          margin: 0
        }}>
          This analysis reveals client investment patterns across budget categories. Target the most 
          active spending tiers for maximum opportunity volume, while understanding client behavior 
          patterns to position your services effectively within each market segment.
        </p>
      </div>
    </div>
  )
} 