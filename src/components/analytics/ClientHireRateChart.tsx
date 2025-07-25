'use client'

import ReactECharts from 'echarts-for-react'
import { ScrapedJob } from '@/lib/supabase'

interface ClientHireRateChartProps {
  jobs: ScrapedJob[]
}

export default function ClientHireRateChart({ jobs }: ClientHireRateChartProps) {
  // Process client hire rate data with detailed analysis
  const processHireRateData = () => {
    console.log('Total jobs:', jobs.length)
    
    const jobsWithHireRate = jobs.filter(job => job.client_hire_rate)
    console.log('Jobs with hire rate:', jobsWithHireRate.length)
    
    const hireRateData = jobsWithHireRate
      .map(job => {
        const rateMatch = job.client_hire_rate?.match(/(\d+(?:\.\d+)?)/)
        const hireRate = rateMatch ? parseFloat(rateMatch[1]) : 0
        console.log(`Job from ${job.client_location}: hire rate = ${job.client_hire_rate} -> parsed = ${hireRate}`)
        return {
          rate: hireRate,
          job,
          totalSpent: job.client_total_spent ? parseFloat(job.client_total_spent.replace(/[\$,]/g, '')) || 0 : 0,
          totalHires: job.client_total_hires ? parseInt(job.client_total_hires.replace(/,/g, '')) || 0 : 0,
          jobsPosted: job.client_jobs_posted ? parseInt(job.client_jobs_posted.replace(/,/g, '')) || 0 : 0
        }
      })
      .filter(item => {
        const isValid = item.rate > 0 && item.rate <= 100
        console.log(`Client with rate ${item.rate}: valid = ${isValid}`)
        return isValid
      })

    console.log('Final processed hire rate data:', hireRateData.length, 'clients')
    return hireRateData
  }

  const hireRateData = processHireRateData()

  // Deduplicate by client to ensure we count unique clients
  const uniqueClients = hireRateData.reduce((acc, item) => {
    const clientKey = `${item.job.client_location}_${item.job.client_total_spent}_${item.rate}`
    if (!acc[clientKey]) {
      acc[clientKey] = item
    }
    return acc
  }, {} as Record<string, any>)

  const uniqueHireRateData = Object.values(uniqueClients)
  console.log('Unique clients after deduplication:', uniqueHireRateData.length)

  // Create meaningful hire rate performance tiers
  const createHireRateTiers = (data: any[]) => {
    const tiers = [
      { label: 'Poor Performance', min: 0, max: 20, color: '#ef4444', description: 'Low hiring success' },
      { label: 'Below Average', min: 20, max: 40, color: '#f97316', description: 'Room for improvement' },
      { label: 'Average Performance', min: 40, max: 60, color: '#f59e0b', description: 'Standard hiring rate' },
      { label: 'Good Performance', min: 60, max: 80, color: '#84cc16', description: 'Above average success' },
      { label: 'Excellent Performance', min: 80, max: 95, color: '#3ecf8e', description: 'High hiring success' },
      { label: 'Perfect Track Record', min: 95, max: 100, color: '#8b5cf6', description: 'Nearly perfect hiring' }
    ]

    console.log('Processing hire rate data:', data.map(d => ({ rate: d.rate, client: d.job?.client_location })))

    return tiers.map(tier => {
      const clients = data.filter(item => {
        // Use inclusive boundaries and handle edge cases properly
        if (tier.max === 100) {
          return item.rate >= tier.min && item.rate <= tier.max
        } else {
          return item.rate >= tier.min && item.rate < tier.max
        }
      })
      
      console.log(`Tier ${tier.label} (${tier.min}-${tier.max}%):`, clients.length, 'clients')
      
      const avgSpent = clients.length > 0 
        ? clients.reduce((sum, c) => sum + c.totalSpent, 0) / clients.length 
        : 0
      
      const avgHires = clients.length > 0 
        ? clients.reduce((sum, c) => sum + c.totalHires, 0) / clients.length 
        : 0

      const avgJobs = clients.length > 0 
        ? clients.reduce((sum, c) => sum + c.jobsPosted, 0) / clients.length 
        : 0

      return {
        ...tier,
        count: clients.length,
        avgSpent: avgSpent.toFixed(0),
        avgHires: avgHires.toFixed(1),
        avgJobs: avgJobs.toFixed(1),
        percentage: ((clients.length / data.length) * 100).toFixed(1),
        clients
      }
    }).filter(tier => tier.count > 0) // Only show tiers with clients
  }

  const hireRateTiers = createHireRateTiers(uniqueHireRateData)
  const maxClients = Math.max(...hireRateTiers.map(tier => tier.count))

  // Calculate insights
  const totalClients = uniqueHireRateData.length
  const avgHireRate = totalClients > 0 ? uniqueHireRateData.reduce((sum, item) => sum + item.rate, 0) / totalClients : 0
  const medianHireRate = uniqueHireRateData.sort((a, b) => a.rate - b.rate)[Math.floor(totalClients / 2)]?.rate || 0
  const excellentClients = uniqueHireRateData.filter(item => item.rate >= 80).length
  const poorClients = uniqueHireRateData.filter(item => item.rate < 40).length

  const option = {
    title: {
      text: 'Client Hire Rate Distribution',
      subtext: `Performance analysis of ${totalClients} clients across ${hireRateTiers.length} performance tiers`,
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
        const tier = hireRateTiers[data.dataIndex]
        return `
          <div style="padding: 10px;">
            <strong style="color: #3ecf8e;">${tier.label}</strong><br/>
            <span style="color: #60a5fa;">📊 Range:</span> ${tier.min}% - ${tier.max}%<br/>
            <span style="color: #f59e0b;">👥 Clients:</span> ${tier.count} (${tier.percentage}%)<br/>
            <span style="color: #8b5cf6;">💰 Avg Spent:</span> $${tier.avgSpent}<br/>
            <span style="color: #10b981;">🎯 Avg Hires:</span> ${tier.avgHires}<br/>
            <span style="color: #ec4899;">📝 Avg Jobs Posted:</span> ${tier.avgJobs}<br/>
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
      data: hireRateTiers.map(tier => tier.label),
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
        data: hireRateTiers.map((tier, index) => ({
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
            const tier = hireRateTiers[params.dataIndex]
            return `${params.value} (${tier.percentage}%)`
          }
        },
        barMaxWidth: 80
      }
    ],
    animation: true,
    animationDuration: 1200,
    animationEasing: 'bounceOut'
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="section-header">Client Hire Rate Analysis</h3>
        <p className="section-subtitle">Understanding client hiring success patterns and performance indicators</p>
      </div>

      {/* Chart Container */}
      <div className="chart-container">
        <ReactECharts 
          option={option} 
          style={{ height: '700px', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>

      {/* Hire Rate Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">📊 Performance Overview</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-secondary">Total Clients:</span>
              <span className="text-accent font-semibold">{totalClients}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Average Hire Rate:</span>
              <span className="text-secondary">{avgHireRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Median Hire Rate:</span>
              <span className="text-secondary">{medianHireRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Excellent (&gt;80%):</span>
              <span className="text-secondary">{excellentClients} clients</span>
            </div>
          </div>
        </div>

        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">🎯 Top Performers</h4>
          <div className="space-y-3 text-sm">
            {hireRateTiers.slice(-2).reverse().map((tier, index) => (
              <div key={tier.label} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-secondary" style={{ color: tier.color }}>
                    {tier.label}:
                  </span>
                  <span className="text-secondary">{tier.count} clients</span>
                </div>
                <div className="text-xs text-muted">
                  Avg spent: ${tier.avgSpent} • {tier.avgHires} hires
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">⚠️ Risk Assessment</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-secondary">Poor (&lt;40%):</span>
              <span className="text-red-400">{poorClients} clients</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Risk Percentage:</span>
              <span className="text-red-400">{((poorClients / totalClients) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Success Rate (&gt;60%):</span>
              <span className="text-green-400">
                {uniqueHireRateData.filter(item => item.rate >= 60).length} clients
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Success Percentage:</span>
              <span className="text-green-400">
                {((uniqueHireRateData.filter(item => item.rate >= 60).length / totalClients) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">💡 Strategy Tips</h4>
          <div className="space-y-2 text-sm text-muted">
            <p>• Prioritize clients with &gt;60% hire rates</p>
            <p>• Excellent performers (&gt;80%) are premium targets</p>
            <p>• Avoid clients with &lt;20% hire rates</p>
            <p>• Build relationships with consistent hirers</p>
          </div>
        </div>
      </div>

      {/* Chart Explanation */}
      <div className="chart-explanation" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h4>🎯 Understanding Client Hire Rate Performance</h4>
        <p>
          This analysis reveals client hiring behavior patterns and success rates. Clients with higher hire rates 
          are more likely to convert proposals into actual work, making them valuable targets for your business 
          development efforts. Focus on building relationships with consistent, high-performing hirers.
        </p>
      </div>
    </div>
  )
} 