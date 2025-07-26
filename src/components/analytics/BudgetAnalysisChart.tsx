'use client'

import ReactECharts from 'echarts-for-react'
import { ScrapedJob } from '@/lib/supabase'

interface BudgetAnalysisChartProps {
  jobs: ScrapedJob[]
}

export default function BudgetAnalysisChart({ jobs }: BudgetAnalysisChartProps) {
  // Process hourly rates into meaningful competitive tiers
  const processHourlyRates = () => {
    const rates: number[] = []
    
    jobs.forEach(job => {
      if (job.budget_amount && job.budget_type?.toLowerCase().includes('hourly')) {
        const amount = job.budget_amount
        
        // Skip non-USD currencies
        if (amount.includes('TL') || amount.includes('EUR') || amount.includes('£') || amount.includes('€')) {
          return
        }

        // Handle ranges like "$28.00 - $56.00" or single values
        const rangeMatch = amount.match(/\$?([\d,]+\.?\d*)\s*-\s*\$?([\d,]+\.?\d*)/)
        const singleMatch = amount.match(/\$?([\d,]+\.?\d*)/)
        
        if (rangeMatch) {
          const minValue = parseFloat(rangeMatch[1].replace(/,/g, ''))
          const maxValue = parseFloat(rangeMatch[2].replace(/,/g, ''))
          const avgValue = (minValue + maxValue) / 2
          
          if (avgValue <= 500) { // Sanity check
            rates.push(avgValue)
          }
        } else if (singleMatch) {
          const numericValue = parseFloat(singleMatch[1].replace(/,/g, ''))
          
          if (numericValue <= 500) { // Sanity check
            rates.push(numericValue)
          }
        }
      }
    })
    
    return rates
  }

  const hourlyRates = processHourlyRates()

  // Create competitive rate tiers
  const createRateTiers = (rates: number[]) => {
    if (rates.length === 0) return []

    const tiers = [
      { name: 'Budget Tier ($10-25/hr)', min: 0, max: 25, color: '#ef4444', description: 'Entry-level competition' },
      { name: 'Standard Tier ($25-40/hr)', min: 25, max: 40, color: '#f97316', description: 'Competitive market' },
      { name: 'Premium Tier ($40-60/hr)', min: 40, max: 60, color: '#f59e0b', description: 'Above average rates' },
      { name: 'Expert Tier ($60-80/hr)', min: 60, max: 80, color: '#84cc16', description: 'Specialized skills' },
      { name: 'Elite Tier ($80-100/hr)', min: 80, max: 100, color: '#3ecf8e', description: 'Top-tier expertise' },
      { name: 'Luxury Tier ($100+/hr)', min: 100, max: Infinity, color: '#8b5cf6', description: 'Premium consultancy' }
    ]

    return tiers.map(tier => {
      const count = rates.filter(rate => {
        if (tier.max === Infinity) {
          return rate >= tier.min
        } else {
          return rate >= tier.min && rate < tier.max
        }
      }).length

      const percentage = rates.length > 0 ? ((count / rates.length) * 100).toFixed(1) : '0'

      return {
        name: tier.name,
        value: count,
        percentage,
        color: tier.color,
        description: tier.description
      }
    }).filter(tier => tier.value > 0) // Only show tiers with jobs
  }

  const rateTiers = createRateTiers(hourlyRates)
  const totalJobs = hourlyRates.length
  const avgRate = totalJobs > 0 ? (hourlyRates.reduce((sum, rate) => sum + rate, 0) / totalJobs).toFixed(2) : '0'
  const medianRate = totalJobs > 0 ? hourlyRates.sort((a, b) => a - b)[Math.floor(totalJobs / 2)].toFixed(2) : '0'

  const option = {
    title: {
      text: 'Competitive Rate Distribution',
      subtext: `Market positioning across ${totalJobs} hourly jobs (Avg: $${avgRate}/hr)`,
      left: 'center',
      top: '3%',
      textStyle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff'
      },
      subtextStyle: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 15, 35, 0.95)',
      borderColor: 'rgba(62, 207, 142, 0.3)',
      borderWidth: 2,
      textStyle: {
        color: '#ffffff',
        fontSize: 13
      },
      formatter: function(params: any) {
        const data = params.data
        return `
          <div style="padding: 10px;">
            <strong style="color: #3ecf8e;">${data.name}</strong><br/>
            <span style="color: #60a5fa;">📊 Jobs:</span> ${data.value} (${data.percentage}%)<br/>
            <span style="color: #f59e0b;">💡 ${data.description}</span>
          </div>
        `
      }
    },
    legend: {
      orient: 'vertical',
      left: '5%',
      top: '25%',
      textStyle: {
        color: '#ffffff',
        fontSize: 12
      },
      formatter: function(name: string) {
        const tier = rateTiers.find(t => t.name === name)
        return `${name} (${tier?.value || 0})`
      }
    },
    series: [
      {
        name: 'Rate Distribution',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['65%', '50%'],
        data: rateTiers.map(tier => ({
          name: tier.name,
          value: tier.value,
          percentage: tier.percentage,
          description: tier.description,
          itemStyle: {
            color: tier.color,
            borderRadius: 8,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 2
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetY: -3,
            shadowColor: 'rgba(62, 207, 142, 0.5)',
            borderColor: 'rgba(255, 255, 255, 0.8)',
            borderWidth: 3,
            scale: 1.1
          }
        },
        labelLine: {
          show: false
        },
        label: {
          show: true,
          position: 'outside',
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 'bold',
          formatter: function(params: any) {
            return `${params.data.percentage}%`
          }
        }
      }
    ],
    animation: true,
    animationDuration: 1200,
    animationEasing: 'cubicOut'
  }

  if (totalJobs === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="section-header">Competitive Rate Distribution</h3>
          <p className="section-subtitle">Market positioning and competitive intelligence</p>
        </div>
        
        <div className="clean-card p-8 text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-accent mb-2">No Rate Data</h3>
          <p className="text-muted">No hourly rate information available for analysis.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="section-header">Competitive Rate Distribution</h3>
        <p className="section-subtitle">Strategic market positioning across hourly rate tiers</p>
      </div>

      {/* Chart Container */}
      <div className="chart-container">
        <ReactECharts 
          option={option} 
          style={{ height: '700px', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>

      {/* Rate Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">💰 Market Overview</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-secondary">Total Jobs:</span>
              <span className="text-accent font-semibold">{totalJobs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Average Rate:</span>
              <span className="text-secondary">${avgRate}/hr</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Median Rate:</span>
              <span className="text-secondary">${medianRate}/hr</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Rate Tiers:</span>
              <span className="text-secondary">{rateTiers.length} active</span>
            </div>
          </div>
        </div>

        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">🎯 Top Tiers</h4>
          <div className="space-y-3 text-sm">
            {rateTiers.slice(-2).reverse().map((tier) => (
              <div key={tier.name} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-secondary" style={{ color: tier.color }}>
                    {tier.name.split(' (')[0]}:
                  </span>
                  <span className="text-secondary">{tier.value} jobs</span>
                </div>
                <div className="text-xs text-muted">{tier.percentage}% • {tier.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">📊 Competition Analysis</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-secondary">Premium+ (&gt;$60/hr):</span>
              <span className="text-secondary">
                {rateTiers.filter(t => t.name.includes('Expert') || t.name.includes('Elite') || t.name.includes('Luxury')).reduce((sum, t) => sum + t.value, 0)} jobs
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Standard ($25-60/hr):</span>
              <span className="text-secondary">
                {rateTiers.filter(t => t.name.includes('Standard') || t.name.includes('Premium')).reduce((sum, t) => sum + t.value, 0)} jobs
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Budget (&lt;$25/hr):</span>
              <span className="text-secondary">
                {rateTiers.filter(t => t.name.includes('Budget')).reduce((sum, t) => sum + t.value, 0)} jobs
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Your Position:</span>
              <span className="text-accent font-semibold">Analyze gaps</span>
            </div>
          </div>
        </div>

        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">💡 Strategy Tips</h4>
          <div className="space-y-2 text-sm text-muted">
            <p>• Target less crowded tiers for better competition</p>
            <p>• Position 10-20% above avg (${(parseFloat(avgRate) * 1.15).toFixed(0)}/hr+)</p>
            <p>• Premium tiers often have higher success rates</p>
            <p>• Avoid oversaturated budget tier competition</p>
          </div>
        </div>
      </div>

      {/* Chart Explanation */}
      <div className="chart-explanation" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h4>🎯 Understanding Rate Competition</h4>
        <p>
          This competitive analysis reveals how jobs are distributed across different hourly rate tiers. 
          Use this intelligence to position your rates strategically - target less saturated tiers or 
          premium segments where clients value quality over price. The market positioning insights help 
          you maximize your earning potential while avoiding oversaturated competition.
        </p>
      </div>
    </div>
  )
} 