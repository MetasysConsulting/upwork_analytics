'use client'

import ReactECharts from 'echarts-for-react'
import { ScrapedJob } from '@/lib/supabase'

interface BudgetAnalysisChartProps {
  jobs: ScrapedJob[]
}

export default function BudgetAnalysisChart({ jobs }: BudgetAnalysisChartProps) {
  // Debug: Check what data we're working with
  console.log('=== BUDGET CHART DEBUG ===')
  console.log('Total jobs:', jobs.length)
  console.log('Sample budget data:', jobs.slice(0, 5).map(job => ({
    id: job.id,
    budget_amount: job.budget_amount,
    budget_type: job.budget_type,
    client_total_spent: job.client_total_spent,
    client_avg_hourly_rate: job.client_avg_hourly_rate
  })))

  // Process budget data with proper range handling
  const budgetData = jobs.reduce((acc, job) => {
    if (job.budget_amount && job.budget_type) {
      const amount = job.budget_amount
      const type = job.budget_type.toLowerCase()
      
      // Handle ranges like "$28.00 - $56.00" or single values like "$100"
      const rangeMatch = amount.match(/\$?([\d,]+\.?\d*)\s*-\s*\$?([\d,]+\.?\d*)/)
      const singleMatch = amount.match(/\$?([\d,]+\.?\d*)/)
      
      if (rangeMatch) {
        // Range: take the minimum value for categorization
        const minValue = parseFloat(rangeMatch[1].replace(/,/g, ''))
        const maxValue = parseFloat(rangeMatch[2].replace(/,/g, ''))
        const avgValue = (minValue + maxValue) / 2
        
        console.log(`Processing range: ${amount} -> min: ${minValue}, max: ${maxValue}, avg: ${avgValue}, type: ${type}`)
        
        if (type.includes('hourly')) {
          acc.hourly.push(avgValue)
        } else if (type.includes('fixed')) {
          acc.fixed.push(avgValue)
        }
      } else if (singleMatch) {
        // Single value
        const numericValue = parseFloat(singleMatch[1].replace(/,/g, ''))
        
        console.log(`Processing single: ${amount} -> value: ${numericValue}, type: ${type}`)
        
        if (type.includes('hourly')) {
          acc.hourly.push(numericValue)
        } else if (type.includes('fixed')) {
          acc.fixed.push(numericValue)
        }
      } else {
        console.log(`Could not parse budget_amount: "${amount}" with type: "${type}"`)
      }
    }
    return acc
  }, { hourly: [] as number[], fixed: [] as number[] })

  console.log('Final budget data:', {
    hourly: budgetData.hourly,
    fixed: budgetData.fixed,
    hourlyCount: budgetData.hourly.length,
    fixedCount: budgetData.fixed.length,
    hourlyMin: budgetData.hourly.length > 0 ? Math.min(...budgetData.hourly) : 0,
    hourlyMax: budgetData.hourly.length > 0 ? Math.max(...budgetData.hourly) : 0
  })

  // Create meaningful budget ranges
  const createBudgetRanges = (values: number[], type: string) => {
    if (values.length === 0) return []
    
    const max = Math.max(...values)
    const min = Math.min(...values)
    const totalJobs = values.length
    
    // Create a single consolidated range for the chart
    const suffix = type.toLowerCase() === 'hourly' ? '/hr' : ''
    const rangeName = `${type}: $${min.toFixed(0)}-$${max.toFixed(0)}${suffix}`
    
    return [{
      name: rangeName,
      value: totalJobs
    }]
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