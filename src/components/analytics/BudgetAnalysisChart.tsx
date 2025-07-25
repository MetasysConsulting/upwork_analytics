'use client'

import ReactECharts from 'echarts-for-react'
import { ScrapedJob } from '@/lib/supabase'

interface BudgetAnalysisChartProps {
  jobs: ScrapedJob[]
}

export default function BudgetAnalysisChart({ jobs }: BudgetAnalysisChartProps) {
  // Process budget data
  const budgetData = jobs.reduce((acc, job) => {
    if (job.budget_amount && job.budget_type) {
      const amount = job.budget_amount
      const type = job.budget_type.toLowerCase()
      
      // Extract numeric value from budget string
      const numericMatch = amount.match(/\$?([\d,]+)/)
      if (numericMatch) {
        const numericValue = parseFloat(numericMatch[1].replace(/,/g, ''))
        
        if (type.includes('hourly')) {
          acc.hourly.push(numericValue)
        } else if (type.includes('fixed')) {
          acc.fixed.push(numericValue)
        }
      }
    }
    return acc
  }, { hourly: [] as number[], fixed: [] as number[] })

  // Create budget ranges
  const createBudgetRanges = (values: number[], type: string) => {
    if (values.length === 0) return []
    
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min
    const bucketSize = range / 5
    
    const ranges = []
    for (let i = 0; i < 5; i++) {
      const start = min + (i * bucketSize)
      const end = min + ((i + 1) * bucketSize)
      const count = values.filter(v => v >= start && v < end).length
      
      if (count > 0) {
        ranges.push({
          name: `${type}: $${start.toFixed(0)}-${end.toFixed(0)}`,
          value: count
        })
      }
    }
    
    return ranges
  }

  const hourlyRanges = createBudgetRanges(budgetData.hourly, 'Hourly')
  const fixedRanges = createBudgetRanges(budgetData.fixed, 'Fixed')

  const option = {
    title: {
      text: 'Budget Distribution by Type',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff'
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 15, 35, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff'
      },
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        color: '#ffffff'
      }
    },
    series: [
      {
        name: 'Budget Distribution',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        data: [
          ...hourlyRanges,
          ...fixedRanges
        ],
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
        <h3 className="section-header">Budget Distribution by Type</h3>
        <p className="section-subtitle">Hourly vs fixed project budget breakdown</p>
      </div>
      <ReactECharts 
        option={option} 
        style={{ height: '600px', margin: '0 auto' }}
        opts={{ renderer: 'canvas' }}
      />
      <div className="chart-explanation" style={{ maxWidth: '800px', margin: '0 auto', marginTop: '24px' }}>
        <h4>💰 What This Shows</h4>
        <p>This donut chart displays the distribution of project budgets by type (hourly vs fixed). Understanding this breakdown helps you target the right project types and set appropriate pricing for your services.</p>
      </div>
    </div>
  )
} 