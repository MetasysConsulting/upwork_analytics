'use client'

import ReactECharts from 'echarts-for-react'
import { ScrapedJob } from '@/lib/supabase'

interface ClientSpendingChartProps {
  jobs: ScrapedJob[]
}

export default function ClientSpendingChart({ jobs }: ClientSpendingChartProps) {
  // Process client spending data with detailed analysis
  const processSpendingData = () => {
    const spendingData = jobs
      .filter(job => job.client_total_spent)
      .map(job => {
        const spentMatch = job.client_total_spent?.match(/\$?([\d,]+)/)
        const amount = spentMatch ? parseFloat(spentMatch[1].replace(/,/g, '')) : 0
        return {
          amount,
          job,
          hireRate: job.client_hire_rate ? parseFloat(job.client_hire_rate) : 0,
          totalHires: job.client_total_hires ? parseInt(job.client_total_hires.replace(/,/g, '')) : 0
        }
      })
      .filter(item => item.amount > 0)

    return spendingData
  }

  const spendingData = processSpendingData()

  // Create more meaningful spending tiers
  const createSpendingTiers = (data: any[]) => {
    const tiers = [
      { label: 'Entry Level', min: 0, max: 1000, color: '#ef4444' },
      { label: 'Small Business', min: 1000, max: 5000, color: '#f59e0b' },
      { label: 'Growing Company', min: 5000, max: 25000, color: '#84cc16' },
      { label: 'Established Business', min: 25000, max: 100000, color: '#3ecf8e' },
      { label: 'Enterprise Client', min: 100000, max: 500000, color: '#60a5fa' },
      { label: 'Fortune 500', min: 500000, max: Infinity, color: '#8b5cf6' }
    ]

    return tiers.map(tier => {
      const clients = data.filter(item => 
        item.amount >= tier.min && item.amount < tier.max
      )
      
      const avgHireRate = clients.length > 0 
        ? clients.reduce((sum, c) => sum + c.hireRate, 0) / clients.length 
        : 0
      
      const totalBudget = clients.reduce((sum, c) => sum + c.amount, 0)
      const avgBudget = clients.length > 0 ? totalBudget / clients.length : 0

      return {
        ...tier,
        count: clients.length,
        avgHireRate: avgHireRate.toFixed(1),
        totalBudget,
        avgBudget: avgBudget.toFixed(0),
        percentage: ((clients.length / data.length) * 100).toFixed(1),
        clients
      }
    }).filter(tier => tier.count > 0)
  }

  const spendingTiers = createSpendingTiers(spendingData)
  const maxClients = Math.max(...spendingTiers.map(tier => tier.count))

  // Calculate insights
  const totalClients = spendingData.length
  const totalSpent = spendingData.reduce((sum, item) => sum + item.amount, 0)
  const avgSpending = totalSpent / totalClients
  const medianSpending = spendingData.sort((a, b) => a.amount - b.amount)[Math.floor(totalClients / 2)]?.amount || 0

  const option = {
    title: {
      text: 'Client Spending Distribution',
      subtext: `Analysis of ${totalClients} clients across ${spendingTiers.length} spending tiers`,
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
        const tier = spendingTiers[data.dataIndex]
        return `
          <div style="padding: 10px;">
            <strong style="color: #3ecf8e;">${tier.label}</strong><br/>
            <span style="color: #60a5fa;">💰 Range:</span> $${tier.min.toLocaleString()} - ${tier.max === Infinity ? '∞' : '$' + tier.max.toLocaleString()}<br/>
            <span style="color: #f59e0b;">👥 Clients:</span> ${tier.count} (${tier.percentage}%)<br/>
            <span style="color: #8b5cf6;">📊 Avg Budget:</span> $${tier.avgBudget}<br/>
            <span style="color: #10b981;">✅ Avg Hire Rate:</span> ${tier.avgHireRate}%<br/>
            <span style="color: #ec4899;">💎 Total Value:</span> $${tier.totalBudget.toLocaleString()}
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
      data: spendingTiers.map(tier => tier.label),
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
        data: spendingTiers.map((tier, index) => ({
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
            const tier = spendingTiers[params.dataIndex]
            return `${params.value} (${tier.percentage}%)`
          }
        },
        barMaxWidth: 80
      }
    ],
    animation: true,
    animationDuration: 1200,
    animationEasing: 'elasticOut'
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="section-header">Client Spending Analysis</h3>
        <p className="section-subtitle">Understanding client investment patterns and budget distributions</p>
      </div>

      {/* Chart Container */}
      <div className="chart-container">
        <ReactECharts 
          option={option} 
          style={{ height: '700px', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>

      {/* Spending Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">💰 Spending Overview</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-secondary">Total Clients:</span>
              <span className="text-accent font-semibold">{totalClients}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Total Spent:</span>
              <span className="text-secondary">${totalSpent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Average Spend:</span>
              <span className="text-secondary">${avgSpending.toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Median Spend:</span>
              <span className="text-secondary">${medianSpending.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">🎯 Top Tier Clients</h4>
          <div className="space-y-3 text-sm">
            {spendingTiers.slice(-2).reverse().map((tier, index) => (
              <div key={tier.label} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-secondary" style={{ color: tier.color }}>
                    {tier.label}:
                  </span>
                  <span className="text-secondary">{tier.count} clients</span>
                </div>
                <div className="text-xs text-muted">
                  Avg: ${tier.avgBudget} • {tier.avgHireRate}% hire rate
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">📊 Market Segments</h4>
          <div className="space-y-3 text-sm">
                         <div className="flex justify-between items-center">
               <span className="text-secondary">Premium (&gt;$25k):</span>
               <span className="text-secondary">
                 {spendingTiers.filter(t => t.min >= 25000).reduce((sum, t) => sum + t.count, 0)} clients
               </span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-secondary">Mid-tier ($5k-$25k):</span>
               <span className="text-secondary">
                 {spendingTiers.filter(t => t.min >= 5000 && t.min < 25000).reduce((sum, t) => sum + t.count, 0)} clients
               </span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-secondary">Entry (&lt;$5k):</span>
               <span className="text-secondary">
                 {spendingTiers.filter(t => t.min < 5000).reduce((sum, t) => sum + t.count, 0)} clients
               </span>
             </div>
          </div>
        </div>

        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">💡 Strategy Tips</h4>
                     <div className="space-y-2 text-sm text-muted">
             <p>• Target {spendingTiers.find(t => t.count === maxClients)?.label.toLowerCase()} clients for volume</p>
             <p>• Premium clients (&gt;$25k) offer highest ROI</p>
             <p>• Build case studies for each tier</p>
             <p>• Adjust proposal approach by spending level</p>
           </div>
        </div>
      </div>

      {/* Chart Explanation */}
      <div className="chart-explanation" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h4>💰 Understanding Client Spending Patterns</h4>
        <p>
          This analysis reveals client investment behaviors across different business tiers. Enterprise and 
          established business clients typically offer higher budgets and better hire rates, while entry-level 
          clients provide volume opportunities for building experience and testimonials.
        </p>
      </div>
    </div>
  )
} 