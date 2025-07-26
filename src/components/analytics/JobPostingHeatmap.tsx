'use client'

import ReactECharts from 'echarts-for-react'
import { ScrapedJob } from '@/lib/supabase'
import { useEffect } from 'react'

interface JobPostingHeatmapProps {
  jobs: ScrapedJob[]
}

export default function JobPostingHeatmap({ jobs }: JobPostingHeatmapProps) {
  
  // Extract posting data by day of week and hour for hourly heatmap
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const hours = Array.from({ length: 24 }, (_, i) => i)
  
  // Initialize data structure for hour vs day heatmap
  const activityCounts: { [key: string]: number } = {}
  
  jobs.forEach((job) => {
    if (job.created_at) {
      const date = new Date(job.created_at)
      const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
      const hour = date.getHours()
      const key = `${dayOfWeek}-${hour}`
      activityCounts[key] = (activityCounts[key] || 0) + 1
    }
  })

  // Convert to heatmap format: [hour, day, count]
  const heatmapData: Array<[number, number, number]> = []
  const maxCount = Math.max(...Object.values(activityCounts), 1)
  
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`
      const count = activityCounts[key] || 0
      heatmapData.push([hour, day, count])
    }
  }

  if (heatmapData.length === 0 || maxCount === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px',
        background: 'rgba(15, 15, 35, 0.6)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ffffff'
      }}>
        <h3 style={{ color: '#10B981' }}>No hourly activity data available</h3>
      </div>
    )
  }

  const option = {
    backgroundColor: '#0a0e1a',
    title: {
      text: '🕐 Hourly Activity Heatmap',
      subtext: 'Job extraction patterns by day and hour • Find your peak productivity times',
      left: 'center',
      top: '2%',
      textStyle: {
        fontSize: 28,
        fontWeight: '600',
        color: '#ffffff'
      },
      subtextStyle: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 16,
        fontWeight: '400'
      }
    },
    tooltip: {
      position: 'top',
      backgroundColor: 'rgba(15, 15, 35, 0.95)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff',
        fontSize: 15
      },
      formatter: function(params: any) {
        const data = params.data
        const hour = data[0]
        const dayOfWeek = data[1]
        const count = data[2]
        const dayName = days[dayOfWeek]
        
        return `
          <div style="padding: 12px; border-radius: 8px;">
            <div style="font-weight: bold; margin-bottom: 8px; color: #10B981;">${dayName}</div>
            <div style="color: #ffffff; margin-bottom: 4px;">
              📅 ${hours[hour]}:00
            </div>
            <div style="color: #ffffff;">
              ${count === 0 ? 'No activity' : `${count} job${count === 1 ? '' : 's'} extracted`}
            </div>
            <div style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-top: 4px;">
              ${count === 0 ? 'Rest day' : 
                count >= maxCount * 0.8 ? 'Very active' :
                count >= maxCount * 0.6 ? 'Active' :
                count >= maxCount * 0.3 ? 'Moderate' : 'Light activity'}
            </div>
          </div>
        `
      }
    },
    grid: {
      left: '4%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: hours.map(h => `${h}:00`),
      axisLabel: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
        interval: 0,
        rotate: 45
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'category',
      data: days,
      axisLabel: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold'
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      }
    },
    visualMap: {
      min: 0,
      max: maxCount,
      calculable: false,
      orient: 'horizontal',
      left: 'center',
      bottom: '3%',
      textStyle: {
        color: '#ffffff',
        fontWeight: '500',
        fontSize: 13
      },
      inRange: {
        color: [
          '#161B22',    // Dark (no activity)
          '#0E4429',    // Dark green (1 job)
          '#006D32',    // Medium green (2-3 jobs)
          '#26A641',    // Bright green (4-5 jobs)
          '#39D353'     // Very bright green (6+ jobs)
        ]
      },
      text: ['More', 'Less'],
      textGap: 15,
      itemWidth: 18,
      itemHeight: 18,
      borderRadius: 3
    },
    series: [
      {
        name: 'Activity',
        type: 'heatmap',
        data: heatmapData,
        itemStyle: {
          borderColor: '#0a0e1a',
          borderWidth: 3,
          borderRadius: 4
        },
        emphasis: {
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 1,
            shadowColor: '#39D353',
            shadowBlur: 8
          }
        },
        animation: true,
        animationDuration: 1000,
        animationDelay: function(idx: number) {
          return idx * 5
        }
      }
    ]
  }

  return (
    <>
      <div 
        style={{ 
          textAlign: 'center',
          background: 'rgba(15, 15, 35, 0.6)',
          borderRadius: '12px',
          padding: '24px',
          margin: '0 auto',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          minHeight: '600px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ReactECharts
          option={option}
          style={{ 
            height: '600px', 
            width: '100%',
            minHeight: '600px'
          }}
          opts={{ renderer: 'canvas' }}
        />
      </div>

      {/* Insight cards outside the chart */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginTop: '32px',
        maxWidth: '100%',
        margin: '32px 0 0 0',
        padding: '0 16px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'left'
        }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            color: '#39D353',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>��</span>
            Peak Activity Time
          </div>
          <div style={{ 
            color: '#ffffff', 
            lineHeight: '1.5',
            fontSize: '13px'
          }}>
            <strong>{(() => {
              const maxEntry = Object.entries(activityCounts).reduce((max, [key, count]) => 
                count > max.count ? { key, count } : max, { key: '', count: 0 })
              const [dayIndex, hour] = maxEntry.key.split('-').map(Number)
              return `${days[dayIndex]} ${hour}:00`
            })()}</strong> is your most productive time with <strong>{Math.max(...Object.values(activityCounts))}</strong> jobs extracted.
          </div>
          <div style={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            lineHeight: '1.5',
            fontSize: '12px',
            marginTop: '6px'
          }}>
            Based on actual extraction data patterns.
          </div>
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'left'
        }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            color: '#FBBF24',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>📊</span>
            Activity Summary
          </div>
          <div style={{ 
            color: '#ffffff', 
            lineHeight: '1.5',
            fontSize: '13px'
          }}>
            <strong>{Object.values(activityCounts).filter(count => count > 0).length} active time slots</strong> across all days with <strong>{Object.values(activityCounts).reduce((sum, count) => sum + count, 0)} total jobs</strong> extracted.
          </div>
          <div style={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            lineHeight: '1.5',
            fontSize: '12px',
            marginTop: '6px'
          }}>
            Hourly patterns reveal your optimal working schedule.
          </div>
        </div>
      </div>
    </>
  )
} 