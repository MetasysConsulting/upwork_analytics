'use client'

import ReactECharts from 'echarts-for-react'
import { ScrapedJob } from '@/lib/supabase'

interface ClientHourlyRateChartProps {
  jobs: ScrapedJob[]
}

export default function ClientHourlyRateChart({ jobs }: ClientHourlyRateChartProps) {
  // Process hourly rate data with enhanced analysis
  const processHourlyRateData = () => {
    const rateData = jobs
      .filter(job => job.client_avg_hourly_rate && job.client_avg_hourly_rate !== 'NULL')
      .map(job => {
        const rateMatch = job.client_avg_hourly_rate?.match(/\$?([\d,]+\.?\d*)/)
        const rate = rateMatch ? parseFloat(rateMatch[1].replace(/,/g, '')) : 0
        
        return {
          rate,
          job,
          industry: job.client_industry || 'Unknown Industry',
          totalSpent: job.client_total_spent ? parseFloat(job.client_total_spent.replace(/[\$,]/g, '')) || 0 : 0,
          hireRate: job.client_hire_rate ? parseFloat(job.client_hire_rate) : 0,
          totalHires: job.client_total_hires ? parseInt(job.client_total_hires.replace(/,/g, '')) || 0 : 0
        }
      })
      .filter(item => item.rate > 0)

    return rateData
  }

  const hourlyRateData = processHourlyRateData()

  // Create meaningful rate tiers instead of just industry averages
  const createRateTiers = (data: any[]) => {
    const tiers = [
      { label: 'Budget Rates', min: 0, max: 15, color: '#ef4444', description: 'Entry-level rates' },
      { label: 'Competitive Rates', min: 15, max: 30, color: '#f97316', description: 'Standard market rates' },
      { label: 'Premium Rates', min: 30, max: 50, color: '#f59e0b', description: 'Above average rates' },
      { label: 'Expert Rates', min: 50, max: 75, color: '#84cc16', description: 'Specialized expertise' },
      { label: 'Elite Rates', min: 75, max: 100, color: '#3ecf8e', description: 'Top-tier professionals' },
      { label: 'Luxury Rates', min: 100, max: Infinity, color: '#8b5cf6', description: 'Premium consultancy' }
    ]

    // Deduplicate by client (same logic as hire rate chart)
    const uniqueClients = data.reduce((acc, item) => {
      const clientKey = `${item.job.client_location}_${item.job.client_total_spent}_${item.rate}`
      if (!acc[clientKey] || acc[clientKey].rate < item.rate) {
        acc[clientKey] = item
      }
      return acc
    }, {} as Record<string, any>)

    const uniqueData = Object.values(uniqueClients)

         return tiers.map(tier => {
       const clients = uniqueData.filter((item: any) => {
         if (tier.max === Infinity) {
           return item.rate >= tier.min
         } else {
           return item.rate >= tier.min && item.rate < tier.max
         }
       })
       
       const avgSpent = clients.length > 0 
         ? clients.reduce((sum: number, c: any) => sum + c.totalSpent, 0) / clients.length 
         : 0
       
       const avgHireRate = clients.length > 0 
         ? clients.reduce((sum: number, c: any) => sum + c.hireRate, 0) / clients.length 
         : 0

       const avgRate = clients.length > 0 
         ? clients.reduce((sum: number, c: any) => sum + c.rate, 0) / clients.length 
         : 0

      return {
        ...tier,
        count: clients.length,
        avgSpent: avgSpent.toFixed(0),
        avgHireRate: avgHireRate.toFixed(1),
        avgRate: avgRate.toFixed(2),
        percentage: ((clients.length / uniqueData.length) * 100).toFixed(1),
        clients,
        maxRate: tier.max === Infinity ? '∞' : tier.max
      }
    }).filter(tier => tier.count > 0)
  }

     const rateTiers = createRateTiers(hourlyRateData)
   const maxClients = rateTiers.length > 0 ? Math.max(...rateTiers.map(tier => tier.count)) : 0

  // Calculate market insights
  const uniqueClients = hourlyRateData.reduce((acc, item) => {
    const clientKey = `${item.job.client_location}_${item.job.client_total_spent}_${item.rate}`
    if (!acc[clientKey] || acc[clientKey].rate < item.rate) {
      acc[clientKey] = item
    }
    return acc
  }, {} as Record<string, any>)

     const uniqueRateData = Object.values(uniqueClients)
   const totalClients = uniqueRateData.length
   const avgRate = totalClients > 0 ? uniqueRateData.reduce((sum: number, item: any) => sum + item.rate, 0) / totalClients : 0
   const medianRate = uniqueRateData.sort((a: any, b: any) => a.rate - b.rate)[Math.floor(totalClients / 2)]?.rate || 0
   const premiumClients = uniqueRateData.filter((item: any) => item.rate >= 50).length
   const budgetClients = uniqueRateData.filter((item: any) => item.rate < 15).length

  const option = {
    title: {
      text: 'Client Hourly Rate Analysis',
      subtext: `Market rate distribution across ${totalClients} clients in ${rateTiers.length} rate tiers`,
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
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(62, 207, 142, 0.1)'
        }
      },
      backgroundColor: 'rgba(15, 15, 35, 0.95)',
      borderColor: 'rgba(62, 207, 142, 0.3)',
      borderWidth: 2,
      textStyle: {
        color: '#ffffff',
        fontSize: 13
      },
      formatter: function(params: any) {
        const data = params[0]
        const tier = rateTiers[data.dataIndex]
        return `
          <div style="padding: 10px;">
            <strong style="color: #3ecf8e;">${tier.label}</strong><br/>
            <span style="color: #60a5fa;">💰 Range:</span> $${tier.min}/hr - $${tier.maxRate}/hr<br/>
            <span style="color: #f59e0b;">👥 Clients:</span> ${tier.count} (${tier.percentage}%)<br/>
            <span style="color: #8b5cf6;">📊 Avg Rate:</span> $${tier.avgRate}/hr<br/>
            <span style="color: #10b981;">✅ Avg Hire Rate:</span> ${tier.avgHireRate}%<br/>
            <span style="color: #ec4899;">💎 Avg Spent:</span> $${tier.avgSpent}<br/>
            <span style="color: #6b7280;">💡 ${tier.description}</span>
          </div>
        `
      }
    },
    grid: {
      left: '8%',
      right: '8%',
      top: '18%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: rateTiers.map(tier => tier.label),
      axisLabel: {
        rotate: 25,
        fontSize: 12,
        color: '#ffffff',
        fontWeight: '500'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)'
        }
      },
      axisTick: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: 'Number of Clients',
      nameLocation: 'middle',
      nameGap: 45,
      nameTextStyle: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold'
      },
      max: Math.ceil(maxClients * 1.1),
      axisLabel: {
        color: '#ffffff',
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)'
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
        name: 'Client Count',
        type: 'bar',
        data: rateTiers.map((tier, index) => ({
          value: tier.count,
          itemStyle: {
            color: tier.color,
            borderRadius: [6, 6, 0, 0],
            shadowBlur: 8,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetY: -3,
            shadowColor: 'rgba(62, 207, 142, 0.4)',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            borderWidth: 2
          },
          scale: 1.05
        },
        label: {
          show: true,
          position: 'top',
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 'bold',
          formatter: function(params: any) {
            const tier = rateTiers[params.dataIndex]
            return `${params.value} (${tier.percentage}%)`
          }
        },
        barMaxWidth: 80
      }
    ],
    animation: true,
    animationDuration: 1200,
    animationEasing: 'cubicOut'
  }

  if (totalClients === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="section-header">Client Hourly Rate Analysis</h3>
          <p className="section-subtitle">Market rate distribution and pricing insights</p>
        </div>
        
        <div className="clean-card p-8 text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-accent mb-2">No Rate Data Found</h3>
          <p className="text-muted">No client hourly rate information available for analysis.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="section-header">Client Hourly Rate Analysis</h3>
        <p className="section-subtitle">Market rate distribution and competitive pricing insights</p>
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
              <span className="text-secondary">Total Clients:</span>
              <span className="text-accent font-semibold">{totalClients}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Average Rate:</span>
              <span className="text-secondary">${avgRate.toFixed(2)}/hr</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Median Rate:</span>
              <span className="text-secondary">${medianRate.toFixed(2)}/hr</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Premium (&gt;$50/hr):</span>
              <span className="text-secondary">{premiumClients} clients</span>
            </div>
          </div>
        </div>

        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">🎯 Top Rate Tiers</h4>
          <div className="space-y-3 text-sm">
            {rateTiers.slice(-2).reverse().map((tier, index) => (
              <div key={tier.label} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-secondary" style={{ color: tier.color }}>
                    {tier.label}:
                  </span>
                  <span className="text-secondary">{tier.count} clients</span>
                </div>
                <div className="text-xs text-muted">
                  Avg: ${tier.avgRate}/hr • {tier.avgHireRate}% hire rate
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">📊 Rate Distribution</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-secondary">Premium (&gt;$50/hr):</span>
              <span className="text-secondary">
                {rateTiers.filter(t => t.min >= 50).reduce((sum, t) => sum + t.count, 0)} clients
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Mid-tier ($15-$50/hr):</span>
              <span className="text-secondary">
                {rateTiers.filter(t => t.min >= 15 && t.min < 50).reduce((sum, t) => sum + t.count, 0)} clients
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Budget (&lt;$15/hr):</span>
              <span className="text-secondary">
                {rateTiers.filter(t => t.min < 15).reduce((sum, t) => sum + t.count, 0)} clients
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Market Position:</span>
              <span className="text-secondary">
                {((premiumClients / totalClients) * 100).toFixed(1)}% premium
              </span>
            </div>
          </div>
        </div>

        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">💡 Pricing Strategy</h4>
          <div className="space-y-2 text-sm text-muted">
            <p>• Target the ${Math.round(avgRate)}/hr+ range for better clients</p>
            <p>• Premium rates (&gt;$50/hr) show higher hire rates</p>
            <p>• Avoid competing in budget tier (&lt;$15/hr)</p>
            <p>• Position skills for ${Math.round(medianRate * 1.3)}/hr+ premium market</p>
          </div>
        </div>
      </div>

      {/* Chart Explanation */}
      <div className="chart-explanation" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h4>💰 Understanding Client Rate Distribution</h4>
        <p>
          This analysis reveals the hourly rate landscape across different client tiers. Premium clients 
          typically pay higher rates and have better hire rates, indicating they value quality over price. 
          Use this intelligence to position your pricing strategy and target the right market segments.
        </p>
      </div>
    </div>
  )
} 