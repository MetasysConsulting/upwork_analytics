'use client'

import ReactECharts from 'echarts-for-react'
import { ScrapedJob } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'

interface InterviewingRateChartProps {
  jobs: ScrapedJob[]
}

export default function InterviewingRateChart({ jobs }: InterviewingRateChartProps) {
  // Process interviewing rate data by date
  const rateByDate = jobs.reduce((acc, job) => {
    if (job.posted_date && job.interviewing_count && job.proposals_count) {
      try {
        const date = parseISO(job.posted_date)
        const dateKey = format(date, 'yyyy-MM-dd')
        
        const interviewingMatch = job.interviewing_count.match(/(\d+)/)
        const proposalsMatch = job.proposals_count.match(/(\d+)/)
        
        if (interviewingMatch && proposalsMatch) {
          const interviewing = parseInt(interviewingMatch[1])
          const proposals = parseInt(proposalsMatch[1])
          
          if (proposals > 0) {
            const rate = (interviewing / proposals) * 100
            
            if (!acc[dateKey]) {
              acc[dateKey] = { rates: [], count: 0 }
            }
            acc[dateKey].rates.push(rate)
            acc[dateKey].count++
          }
        }
      } catch (error) {
        // Skip invalid dates
      }
    }
    return acc
  }, {} as Record<string, { rates: number[], count: number }>)

  // Calculate average rate for each date
  const chartData = Object.entries(rateByDate)
    .map(([date, data]) => ({
      date,
      avgRate: data.rates.reduce((a, b) => a + b, 0) / data.rates.length,
      jobCount: data.count
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-20) // Last 20 dates

  const option = {
    title: {
      text: 'Interviewing Rate Trends',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        const data = params[0]
        const pointData = chartData[data.dataIndex]
        return `${data.name}<br/>Avg Rate: ${data.value.toFixed(1)}%<br/>Jobs: ${pointData.jobCount}`
      }
    },
    xAxis: {
      type: 'category',
      data: chartData.map(item => item.date),
      axisLabel: {
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      name: 'Interviewing Rate (%)',
      nameLocation: 'middle',
      nameGap: 40,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: 'Interviewing Rate',
        type: 'line',
        data: chartData.map(item => item.avgRate),
        smooth: true,
        lineStyle: {
          color: '#10B981',
          width: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
            ]
          }
        },
        itemStyle: {
          color: '#10B981'
        }
      }
    ],
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '15%'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <ReactECharts 
        option={option} 
        style={{ height: '400px' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  )
} 