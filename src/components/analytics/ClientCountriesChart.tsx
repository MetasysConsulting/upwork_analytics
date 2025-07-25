'use client'

import ReactECharts from 'echarts-for-react'
import { ScrapedJob } from '@/lib/supabase'

interface ClientCountriesChartProps {
  jobs: ScrapedJob[]
}

export default function ClientCountriesChart({ jobs }: ClientCountriesChartProps) {
  // Process client countries data with more details
  const countryData = jobs.reduce((acc, job) => {
    const country = job.client_location || 'Worldwide'
    if (!acc[country]) {
      acc[country] = {
        count: 0,
        totalBudget: 0,
        avgBudget: 0,
        jobs: []
      }
    }
    acc[country].count += 1
    acc[country].jobs.push(job)
    
    // Calculate budget info
    if (job.budget_amount) {
      const budgetMatch = job.budget_amount.match(/\$?([\d.]+)/)
      if (budgetMatch) {
        const budget = parseFloat(budgetMatch[1])
        acc[country].totalBudget += budget
        acc[country].avgBudget = acc[country].totalBudget / acc[country].count
      }
    }
    
    return acc
  }, {} as Record<string, any>)

  // Sort by job count and take top 12 for better visibility
  const topCountries = Object.entries(countryData)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 12)
    .map(([country, data]) => ({
      country: country.length > 20 ? country.substring(0, 20) + '...' : country,
      fullCountry: country,
      count: data.count,
      avgBudget: data.avgBudget,
      percentage: ((data.count / jobs.length) * 100).toFixed(1)
    }))

  const maxJobs = Math.max(...topCountries.map(item => item.count))

  const option = {
    title: {
      text: 'Top Client Countries',
      subtext: `Distribution of ${jobs.length} jobs across ${Object.keys(countryData).length} countries`,
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
        const item = topCountries[data.dataIndex]
        return `
          <div style="padding: 8px;">
            <strong style="color: #3ecf8e;">${item.fullCountry}</strong><br/>
            <span style="color: #60a5fa;">📊 Jobs:</span> ${data.value} (${item.percentage}%)<br/>
            <span style="color: #f59e0b;">💰 Avg Budget:</span> $${item.avgBudget ? item.avgBudget.toFixed(0) : 'N/A'}<br/>
            <span style="color: #8b5cf6;">🎯 Market Share:</span> ${item.percentage}% of total jobs
          </div>
        `
      }
    },
    grid: {
      left: '15%',
      right: '8%',
      top: '18%',
      bottom: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: 'Number of Jobs',
      nameLocation: 'middle',
      nameGap: 35,
      nameTextStyle: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold'
      },
      max: Math.ceil(maxJobs * 1.1),
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
    yAxis: {
      type: 'category',
      data: topCountries.map(item => item.country),
      axisLabel: {
        fontSize: 13,
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
    series: [
      {
        name: 'Jobs by Country',
        type: 'bar',
        data: topCountries.map((item, index) => ({
          value: item.count,
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            shadowBlur: 8,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        })),
        itemStyle: {
          color: function(params: any) {
            // Gradient colors based on performance
            const colors = [
              '#3ecf8e', // Primary accent green
              '#60a5fa', // Blue
              '#f59e0b', // Orange  
              '#8b5cf6', // Purple
              '#ef4444', // Red
              '#06b6d4', // Cyan
              '#84cc16', // Lime
              '#f97316', // Orange-red
              '#ec4899', // Pink
              '#6366f1', // Indigo
              '#10b981', // Emerald
              '#f59e0b'  // Amber
            ]
            return colors[params.dataIndex % colors.length]
          },
          borderRadius: [0, 6, 6, 0],
          shadowBlur: 8,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 2,
            shadowColor: 'rgba(62, 207, 142, 0.4)',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            borderWidth: 2
          },
          scale: 1.05
        },
        label: {
          show: true,
          position: 'right',
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 'bold',
          formatter: function(params: any) {
            const item = topCountries[params.dataIndex]
            return `${params.value} (${item.percentage}%)`
          }
        },
        barMaxWidth: 35
      }
    ],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="section-header">Global Client Distribution</h3>
        <p className="section-subtitle">Discover where your highest-value clients are located worldwide</p>
      </div>

      {/* Chart Container */}
      <div className="chart-container">
        <ReactECharts 
          option={option} 
          style={{ height: '700px', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>

      {/* Market Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">🌍 Market Distribution</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-secondary">Top Market:</span>
              <span className="text-accent font-semibold">{topCountries[0]?.fullCountry}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Market Share:</span>
              <span className="text-secondary">{topCountries[0]?.percentage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Total Countries:</span>
              <span className="text-secondary">{Object.keys(countryData).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Top 3 Markets:</span>
              <span className="text-secondary">{topCountries.slice(0, 3).reduce((sum, c) => sum + parseFloat(c.percentage), 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">💰 Budget Insights</h4>
          <div className="space-y-3 text-sm">
            {topCountries.slice(0, 4).map((country, index) => (
              <div key={country.fullCountry} className="flex justify-between items-center">
                <span className="text-secondary">{country.country}:</span>
                <span className="text-secondary">
                  ${country.avgBudget ? country.avgBudget.toFixed(0) : 'N/A'} avg
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">🎯 Strategy Tips</h4>
          <div className="space-y-3 text-sm text-muted">
            <p>• Focus on the top 3 markets for 60%+ of opportunities</p>
            <p>• Consider timezone overlap for better client communication</p>
            <p>• Research local business customs and payment preferences</p>
            <p>• Build case studies from successful projects in key markets</p>
          </div>
        </div>
      </div>

      {/* Chart Explanation */}
      <div className="chart-explanation" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h4>🌍 Understanding Global Client Distribution</h4>
        <p>
          This chart shows where your highest-opportunity clients are located geographically. 
          Focus your marketing and outreach efforts on the top markets, but don't overlook 
          emerging opportunities in smaller markets that might have less competition.
        </p>
      </div>
    </div>
  )
} 