'use client'

import ReactECharts from 'echarts-for-react'
import { ScrapedJob } from '@/lib/supabase'

interface InterviewingRateChartProps {
  jobs: ScrapedJob[]
}

export default function InterviewingRateChart({ jobs }: InterviewingRateChartProps) {
  // Extract interviewing data
  const interviewingData = jobs
    .filter(job => job.interviewing_count !== null && job.interviewing_count !== undefined)
    .map(job => ({
      count: typeof job.interviewing_count === 'string' 
        ? parseInt(job.interviewing_count) 
        : job.interviewing_count || 0
    }))

  if (interviewingData.length === 0) {
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

  // Define interviewing ranges
  const interviewRanges = [
    { name: 'No Interviews (0)', min: 0, max: 0, color: '#6B7280', icon: '😴' },
    { name: 'Low Activity (1-3)', min: 1, max: 3, color: '#10B981', icon: '📝' },
    { name: 'Moderate (4-8)', min: 4, max: 8, color: '#3B82F6', icon: '💼' },
    { name: 'High Activity (9-15)', min: 9, max: 15, color: '#F59E0B', icon: '🔥' },
    { name: 'Very Active (16+)', min: 16, max: Infinity, color: '#EF4444', icon: '🚀' }
  ]

  // Count jobs in each range
  const rangeCounts = interviewRanges.map(range => {
    const count = interviewingData.filter(item => 
      item.count >= range.min && item.count <= range.max
    ).length
    const percentage = ((count / interviewingData.length) * 100)
    return {
      ...range,
      count,
      percentage
    }
  }).filter(range => range.count > 0)

  const option = {
    backgroundColor: '#0a0e1a',
    title: {
      text: '🎯 Interview Activity Analysis',
      subtext: `Competition analysis from ${interviewingData.length} jobs with interview data`,
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
        const percentage = ((data.value / interviewingData.length) * 100).toFixed(1)
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
            const percentage = ((params.value / interviewingData.length) * 100).toFixed(1)
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