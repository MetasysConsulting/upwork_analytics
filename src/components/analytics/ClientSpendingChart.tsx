'use client'

import ReactECharts from 'echarts-for-react'
import { ScrapedJob } from '@/lib/supabase'

interface ClientSpendingChartProps {
  jobs: ScrapedJob[]
}

export default function ClientSpendingChart({ jobs }: ClientSpendingChartProps) {
  // Extract spending data from jobs
  const spendingData = jobs
    .filter(job => job.client_total_spent && job.client_total_spent !== '')
    .map(job => {
      // Parse spending amount from strings like "$5,000+" or "$10,000"
      const spentStr = job.client_total_spent || ''
      const match = spentStr.match(/\$?([\d,]+)/)
      if (match) {
        const amount = parseInt(match[1].replace(/,/g, ''))
                 return { id: String(job.id), amount }
      }
      return null
    })
    .filter(item => item !== null) as { id: string; amount: number }[]

  if (spendingData.length === 0) {
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

  // Define spending tiers
  const spendingTiers = [
    { name: 'Starter ($1-$1K)', min: 1, max: 1000, color: '#FF6B6B', icon: '🌱' },
    { name: 'Growing ($1K-$5K)', min: 1000, max: 5000, color: '#4ECDC4', icon: '📈' },
    { name: 'Established ($5K-$25K)', min: 5000, max: 25000, color: '#45B7D1', icon: '🏢' },
    { name: 'Corporate ($25K-$100K)', min: 25000, max: 100000, color: '#A29BFE', icon: '🏛️' },
    { name: 'Enterprise ($100K+)', min: 100000, max: Infinity, color: '#FF9F43', icon: '👑' }
  ]

  // Count clients in each tier
  const tierCounts = spendingTiers.map(tier => {
    const count = spendingData.filter(client => 
      client.amount >= tier.min && client.amount < tier.max
    ).length
    const percentage = ((count / spendingData.length) * 100)
    return {
      ...tier,
      count,
      percentage
    }
  }).filter(tier => tier.count > 0)

  const totalClients = spendingData.length

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