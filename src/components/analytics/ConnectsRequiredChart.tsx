'use client'

import ReactECharts from 'echarts-for-react'
import { ScrapedJob } from '@/lib/supabase'

interface ConnectsRequiredChartProps {
  jobs: ScrapedJob[]
}

export default function ConnectsRequiredChart({ jobs }: ConnectsRequiredChartProps) {
  // Extract connects data
  const connectsData = jobs
    .map(job => {
      const connects = typeof job.connects_required === 'string' 
        ? parseInt(job.connects_required) 
        : job.connects_required
      return connects && connects > 0 ? connects : null
    })
    .filter(connects => connects !== null) as number[]

  if (connectsData.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px',
        background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(245, 158, 11, 0.3) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ffffff'
      }}>
        <h3 style={{ color: '#F59E0B' }}>No connects data available</h3>
      </div>
    )
  }

  // Define connect ranges
  const connectRanges = [
    { name: 'Low (1-5)', min: 1, max: 5, color: '#4ECDC4', icon: '🟢' },
    { name: 'Medium (6-10)', min: 6, max: 10, color: '#FFB347', icon: '🟡' },
    { name: 'High (11-15)', min: 11, max: 15, color: '#FF6B6B', icon: '🟠' },
    { name: 'Very High (16-20)', min: 16, max: 20, color: '#A29BFE', icon: '🔴' },
    { name: 'Premium (21+)', min: 21, max: Infinity, color: '#E67E22', icon: '💎' }
  ]

  // Count jobs in each range
  const rangeCounts = connectRanges.map(range => {
    const count = connectsData.filter(connects => 
      connects >= range.min && connects < range.max
    ).length
    const percentage = ((count / connectsData.length) * 100)
    return {
      ...range,
      count,
      percentage
    }
  }).filter(range => range.count > 0)

  const option = {
    backgroundColor: '#0a0e1a',
    title: {
      text: '🔗 Connects Investment Analysis',
      subtext: `Strategic analysis of ${connectsData.length} jobs requiring connects across ${rangeCounts.length} investment tiers`,
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
          color: 'rgba(245, 158, 11, 0.1)'
        }
      },
      backgroundColor: 'rgba(15, 15, 35, 0.95)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff',
        fontSize: 14
      },
      formatter: function(params: any) {
        const data = params.data
        const percentage = ((data.value / connectsData.length) * 100).toFixed(1)
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
        name: 'Investment Distribution',
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
                  offset: 0.7,
                  color: range.color + 'AA'
                },
                {
                  offset: 1,
                  color: range.color + '44'
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
            const percentage = ((params.value / connectsData.length) * 100).toFixed(1)
            return `${params.value} (${percentage}%)`
          }
        },
        barMaxWidth: 30
      }
    ],
    animation: true,
    animationDuration: 2200,
    animationEasing: 'bounceOut',
    animationDelay: function (idx: number) {
      return idx * 180
    }
  }

  return (
    <div style={{ 
      textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(245, 158, 11, 0.2) 50%, rgba(139, 92, 246, 0.2) 100%)',
      borderRadius: '16px',
      padding: '24px',
      margin: '16px 0',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 20px 40px rgba(245, 158, 11, 0.3)'
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
        border: '1px solid rgba(245, 158, 11, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <h4 style={{ 
          color: '#F59E0B', 
          marginBottom: '12px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          🚀 Connect Investment Strategy
        </h4>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          lineHeight: '1.7',
          fontSize: '14px',
          margin: 0
        }}>
          Master your connect allocation with this strategic analysis! Lower connect requirements often 
          signal accessible opportunities with less competition, while higher investments may unlock 
          premium projects. Balance your portfolio across investment tiers to maximize ROI and 
          maintain sustainable application velocity in the competitive marketplace.
        </p>
      </div>
    </div>
  )
} 