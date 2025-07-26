'use client'

import ReactECharts from 'echarts-for-react'
import { ScrapedJob } from '@/lib/supabase'

interface BudgetAnalysisChartProps {
  jobs: ScrapedJob[]
}

export default function BudgetAnalysisChart({ jobs }: BudgetAnalysisChartProps) {
  // Extract all budget data from jobs (both hourly and fixed-price)
  const budgetData = jobs
    .filter(job => job.budget_amount && job.budget_amount.trim() !== '')
    .map(job => {
      const budgetStr = job.budget_amount || ''
      const budgetType = job.budget_type?.toLowerCase() || 'unknown'
      
      // Extract monetary values from budget strings
      const matches = budgetStr.match(/\$?([\d,]+\.?\d*)/g)
      if (!matches) return null
      
      const amounts = matches.map(match => parseFloat(match.replace(/[\$,]/g, '')))
      let estimatedValue = 0
      
      if (budgetType === 'hourly') {
        // For hourly: assume 40 hours for comparison (average small project)
        const avgRate = amounts.reduce((sum, rate) => sum + rate, 0) / amounts.length
        estimatedValue = avgRate * 40
      } else {
        // For fixed-price: use the average or single value
        estimatedValue = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
      }
      
      return {
        value: estimatedValue,
        type: budgetType,
        originalBudget: budgetStr,
        jobTitle: job.title || 'Untitled'
      }
    })
    .filter(item => item !== null && item.value > 0) as Array<{
      value: number;
      type: string;
      originalBudget: string;
      jobTitle: string;
    }>

  if (budgetData.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px',
        background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(255, 193, 7, 0.3) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ffffff'
      }}>
        <h3 style={{ color: '#FFC107' }}>No budget data available</h3>
      </div>
    )
  }

  // Define comprehensive budget ranges
  const budgetRanges = [
    { 
      name: 'Micro Projects ($1-$100)', 
      min: 1, 
      max: 100, 
      color: '#FF6B6B', 
      icon: '🔧',
      description: 'Quick tasks & fixes'
    },
    { 
      name: 'Small Projects ($100-$500)', 
      min: 100, 
      max: 500, 
      color: '#FFB347', 
      icon: '📱',
      description: 'Short-term work'
    },
    { 
      name: 'Medium Projects ($500-$2K)', 
      min: 500, 
      max: 2000, 
      color: '#4ECDC4', 
      icon: '💼',
      description: 'Standard projects'
    },
    { 
      name: 'Large Projects ($2K-$5K)', 
      min: 2000, 
      max: 5000, 
      color: '#45B7D1', 
      icon: '🏢',
      description: 'Major deliverables'
    },
    { 
      name: 'Enterprise ($5K-$15K)', 
      min: 5000, 
      max: 15000, 
      color: '#A29BFE', 
      icon: '🏛️',
      description: 'Complex solutions'
    },
    { 
      name: 'Premium ($15K+)', 
      min: 15000, 
      max: Infinity, 
      color: '#FD79A8', 
      icon: '👑',
      description: 'High-value contracts'
    }
  ]

  // Count projects in each budget range
  const rangeCounts = budgetRanges.map(range => {
    const projectsInRange = budgetData.filter(item => 
      item.value >= range.min && item.value < range.max
    )
    
    const count = projectsInRange.length
    const percentage = ((count / budgetData.length) * 100)
    const avgBudget = count > 0 
      ? projectsInRange.reduce((sum, item) => sum + item.value, 0) / count 
      : 0
    
    return {
      ...range,
      count,
      percentage,
      avgBudget: Math.round(avgBudget)
    }
  }).filter(range => range.count > 0)

  // Calculate insights
  const totalProjects = budgetData.length
  const avgProjectValue = Math.round(budgetData.reduce((sum, item) => sum + item.value, 0) / totalProjects)
  const hourlyProjects = budgetData.filter(item => item.type === 'hourly').length
  const fixedProjects = budgetData.filter(item => item.type === 'fixed').length

  const option = {
    backgroundColor: '#0a0e1a',
    title: {
      text: '💰 Project Budget Landscape',
      subtext: `Comprehensive analysis of ${totalProjects} projects • Avg Value: $${avgProjectValue.toLocaleString()} • ${Math.round((hourlyProjects/totalProjects)*100)}% Hourly`,
      left: 'center',
      top: '3%',
      textStyle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff'
      },
      subtextStyle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 16,
        fontWeight: '500'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(255, 193, 7, 0.1)'
        }
      },
      backgroundColor: 'rgba(15, 15, 35, 0.95)',
      borderColor: 'rgba(255, 193, 7, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff',
        fontSize: 14
      },
      formatter: function(params: any) {
        const data = params.data
        const rangeInfo = rangeCounts[params.dataIndex]
        return `
          <div style="padding: 18px; border-radius: 8px; background: linear-gradient(135deg, ${rangeInfo.color}20, ${rangeInfo.color}08);">
            <div style="text-align: center; margin-bottom: 12px;">
              <span style="font-size: 28px;">${rangeInfo.icon}</span>
            </div>
            <strong style="color: ${rangeInfo.color}; font-size: 18px; display: block; margin-bottom: 12px;">${rangeInfo.name}</strong>
            <div style="margin: 10px 0;">
              <span style="color: #4ECDC4;">📊 Projects:</span> <span style="color: #ffffff; font-weight: bold;">${rangeInfo.count}</span>
            </div>
            <div style="margin: 10px 0;">
              <span style="color: #FF6B6B;">📈 Market Share:</span> <span style="color: #ffffff; font-weight: bold;">${rangeInfo.percentage.toFixed(1)}%</span>
            </div>
            <div style="margin: 10px 0;">
              <span style="color: #A29BFE;">💎 Avg Budget:</span> <span style="color: #ffffff; font-weight: bold;">$${rangeInfo.avgBudget.toLocaleString()}</span>
            </div>
            <div style="margin: 10px 0; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #FFC107; font-style: italic;">${rangeInfo.description}</span>
            </div>
          </div>
        `
      }
    },
    grid: {
      left: '30%',
      right: '5%',
      bottom: '12%',
      top: '20%',
      containLabel: false
    },
    xAxis: {
      type: 'value',
      min: 0,
      name: 'Number of Projects',
      nameLocation: 'middle',
      nameGap: 35,
      nameTextStyle: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold'
      },
      axisLabel: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '500'
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 1
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: rangeCounts.map(range => {
        const [name, rangeText] = range.name.split(' (');
        return `${range.icon} ${name}\n(${rangeText}`;
      }),
      axisLabel: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: 'bold',
        margin: 15,
        align: 'right',
        lineHeight: 14
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 1
        }
      },
      axisTick: {
        show: false
      }
    },
    series: [
      {
        name: 'Project Distribution',
        type: 'bar',
        data: rangeCounts.map((range, index) => ({
          value: range.count,
          name: range.name,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                {
                  offset: 0,
                  color: range.color
                },
                {
                  offset: 0.6,
                  color: range.color + 'DD'
                },
                {
                  offset: 1,
                  color: range.color + '77'
                }
              ]
            },
            borderRadius: [0, 12, 12, 0]
          }
        })),
        emphasis: {
          itemStyle: {
            scale: 1.05
          }
        },
        label: {
          show: true,
          position: 'right',
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 'bold',
          formatter: function(params: any) {
            const rangeInfo = rangeCounts[params.dataIndex]
            return `${params.value} (${rangeInfo.percentage.toFixed(1)}%)`
          }
        },
        barMaxWidth: 35
      }
    ],
    animation: true,
    animationDuration: 2000,
    animationEasing: 'elasticOut',
    animationDelay: function (idx: number) {
      return idx * 150
    }
  }

  return (
    <div style={{ 
      textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(60, 30, 90, 0.8) 100%)',
      borderRadius: '16px',
      padding: '24px',
      margin: '16px 0',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 20px 40px rgba(155, 89, 182, 0.2)'
    }}>
      <ReactECharts 
        option={option} 
        style={{ height: '800px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
      
      <div style={{ 
        maxWidth: '900px', 
        margin: '24px auto 0', 
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <h4 style={{ 
          color: '#9B59B6', 
          marginBottom: '12px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          🎯 Strategic Rate Intelligence
        </h4>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          lineHeight: '1.7',
          fontSize: '14px',
          margin: 0
        }}>
          This comprehensive rate analysis reveals market positioning opportunities across all skill tiers. 
          Each segment represents a distinct market category with unique characteristics and competition levels. 
          Position your pricing strategically within your expertise tier, target underserved premium segments, 
          and understand competitive density to maximize your earning potential while maintaining market competitiveness.
        </p>
      </div>
    </div>
  )
} 