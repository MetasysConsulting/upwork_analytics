'use client'

import ReactECharts from 'echarts-for-react'
import { ScrapedJob } from '@/lib/supabase'
import { parseISO, format } from 'date-fns'

interface JobsOverTimeChartProps {
  jobs: ScrapedJob[]
}

export default function JobsOverTimeChart({ jobs }: JobsOverTimeChartProps) {
  // Process job creation dates
  const jobDates = jobs
    .filter(job => job.created_at)
    .map(job => {
      try {
        return parseISO(job.created_at!)
      } catch {
        return null
      }
    })
    .filter(date => date !== null) as Date[]

  // Count jobs by date
  const dateCounts = jobDates.reduce((acc, date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    acc[dateStr] = (acc[dateStr] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Sort dates and prepare data
  const sortedDates = Object.keys(dateCounts).sort()
  const data = sortedDates.map(date => [date, dateCounts[date]])

  const option = {
    title: {
      text: 'Jobs Posted Over Time',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff'
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 15, 35, 0.9)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff'
      },
      formatter: function(params: any) {
        const data = params[0]
        return `${data.name}<br/>Jobs: ${data.value[1]}`
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '15%'
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        color: '#ffffff',
        fontSize: 10
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      name: 'Number of Jobs',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        color: '#ffffff'
      },
      axisLabel: {
        color: '#ffffff'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    series: [
      {
        name: 'Jobs Posted',
        type: 'line',
        data: data,
        smooth: true,
        lineStyle: {
          color: '#3b82f6',
          width: 3
        },
        itemStyle: {
          color: '#3b82f6',
          borderColor: '#ffffff',
          borderWidth: 2
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
            color: '#60a5fa',
            borderColor: '#ffffff',
            borderWidth: 3,
            shadowColor: 'rgba(59, 130, 246, 0.5)',
            shadowBlur: 10
          }
        }
      }
    ]
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="mb-8">
        <h3 className="section-header">Jobs Posted Over Time</h3>
        <p className="section-subtitle">Track job posting trends and identify peak hiring periods</p>
      </div>
      <ReactECharts 
        option={option} 
        style={{ height: '600px', margin: '0 auto' }}
        opts={{ renderer: 'canvas' }}
      />
      <div className="chart-explanation" style={{ maxWidth: '800px', margin: '0 auto', marginTop: '24px' }}>
        <h4>📈 What This Shows</h4>
        <p>This line chart displays the number of jobs posted over time, helping you identify when companies are most active in hiring. Look for patterns like seasonal spikes or consistent posting trends to optimize your job search timing.</p>
      </div>
    </div>
  )
} 