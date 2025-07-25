'use client'

import ReactECharts from 'echarts-for-react'
import { ScrapedJob } from '@/lib/supabase'

interface ConnectsRequiredChartProps {
  jobs: ScrapedJob[]
}

export default function ConnectsRequiredChart({ jobs }: ConnectsRequiredChartProps) {
  // Process connects required data
  const connectsData = jobs
    .filter(job => job.connects_required)
    .map(job => {
      const connectsMatch = job.connects_required?.match(/(\d+)/)
      return connectsMatch ? parseInt(connectsMatch[1]) : 0
    })
    .filter(connects => connects > 0)

  // Group connects into ranges
  const connectsRanges = {
    '1-5': 0,
    '6-10': 0,
    '11-15': 0,
    '16-20': 0,
    '21+': 0
  }

  connectsData.forEach(connects => {
    if (connects <= 5) connectsRanges['1-5']++
    else if (connects <= 10) connectsRanges['6-10']++
    else if (connects <= 15) connectsRanges['11-15']++
    else if (connects <= 20) connectsRanges['16-20']++
    else connectsRanges['21+']++
  })

  const chartData = Object.entries(connectsRanges).map(([range, count]) => ({
    range,
    count
  }))

  const option = {
    title: {
      text: 'Jobs by Connects Required',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        name: 'Connects Required',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        data: chartData.map(item => ({
          name: `${item.range} connects`,
          value: item.count
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: false
        },
        labelLine: {
          show: false
        }
      }
    ]
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="mb-8">
        <h3 className="section-header">Jobs by Connects Required</h3>
        <p className="section-subtitle">Distribution of jobs by required connects</p>
      </div>
      <ReactECharts 
        option={option} 
        style={{ height: '600px', margin: '0 auto' }}
        opts={{ renderer: 'canvas' }}
      />
      <div className="chart-explanation" style={{ maxWidth: '800px', margin: '0 auto', marginTop: '24px' }}>
        <h4>🔗 What This Shows</h4>
        <p>This chart shows how many connects are typically required for different jobs. Lower connect requirements often indicate less competitive positions, while higher requirements may signal premium opportunities.</p>
      </div>
    </div>
  )
} 