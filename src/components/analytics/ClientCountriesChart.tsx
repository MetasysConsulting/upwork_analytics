'use client'

import ReactECharts from 'echarts-for-react'
import { ScrapedJob } from '@/lib/supabase'

interface ClientCountriesChartProps {
  jobs: ScrapedJob[]
}

export default function ClientCountriesChart({ jobs }: ClientCountriesChartProps) {
  // Extract and count client locations
  const locationCounts: Record<string, number> = {}
  
  jobs.forEach(job => {
    if (job.client_location) {
      const location = job.client_location.trim()
      if (location && location !== 'Unknown' && location !== '') {
        locationCounts[location] = (locationCounts[location] || 0) + 1
      }
    }
  })

  // Sort by count and get top countries
  const countryData = Object.entries(locationCounts)
    .map(([country, count]) => ({
      country,
      count,
      percentage: ((count / jobs.length) * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12) // Top 12 countries

  if (countryData.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px',
        background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(90, 30, 60, 0.8) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ffffff'
      }}>
        <h3 style={{ color: '#FF6B6B' }}>No client location data available</h3>
      </div>
    )
  }

  // Vibrant colors for countries
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', 
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#6C5CE7', '#FD79A8'
  ]

  // Map countries to flag emojis
  const countryFlags: Record<string, string> = {
    'United States': '🇺🇸',
    'United States of America': '🇺🇸',
    'USA': '🇺🇸',
    'United Kingdom': '🇬🇧',
    'UK': '🇬🇧',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Netherlands': '🇳🇱',
    'India': '🇮🇳',
    'Brazil': '🇧🇷',
    'Italy': '🇮🇹',
    'Spain': '🇪🇸',
    'Sweden': '🇸🇪',
    'Norway': '🇳🇴',
    'Denmark': '🇩🇰',
    'Switzerland': '🇨🇭',
    'Poland': '🇵🇱',
    'Israel': '🇮🇱',
    'Singapore': '🇸🇬',
    'Japan': '🇯🇵',
    'South Korea': '🇰🇷',
    'China': '🇨🇳',
    'Mexico': '🇲🇽',
    'Argentina': '🇦🇷',
    'Chile': '🇨🇱',
    'Colombia': '🇨🇴',
    'South Africa': '🇿🇦',
    'Nigeria': '🇳🇬',
    'Kenya': '🇰🇪',
    'UAE': '🇦🇪',
    'United Arab Emirates': '🇦🇪',
    'Saudi Arabia': '🇸🇦',
    'Turkey': '🇹🇷',
    'Russia': '🇷🇺',
    'Ukraine': '🇺🇦',
    'Pakistan': '🇵🇰',
    'Bangladesh': '🇧🇩',
    'Philippines': '🇵🇭',
    'Indonesia': '🇮🇩',
    'Thailand': '🇹🇭',
    'Vietnam': '🇻🇳',
    'Malaysia': '🇲🇾',
    'New Zealand': '🇳🇿'
  }

  const option = {
    backgroundColor: '#0a0e1a',
    title: {
      text: '🌍 Global Client Distribution',
      subtext: `Geographic analysis from ${jobs.length} jobs across ${countryData.length} countries`,
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
          color: 'rgba(72, 187, 120, 0.1)'
        }
      },
      backgroundColor: 'rgba(15, 15, 35, 0.95)',
      borderColor: 'rgba(72, 187, 120, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff',
        fontSize: 14
      },
      formatter: function(params: any) {
        const data = params.data
        const percentage = ((data.value / jobs.length) * 100).toFixed(1)
        return `
          <div style="padding: 15px; border-radius: 8px; background: linear-gradient(135deg, ${data.itemStyle.color}15, ${data.itemStyle.color}05);">
            <div style="text-align: center; margin-bottom: 10px;">
              <span style="font-size: 24px;">${data.flag}</span>
            </div>
            <strong style="color: ${data.itemStyle.color}; font-size: 16px; display: block; margin-bottom: 10px;">${data.name}</strong>
            <div style="margin: 8px 0;">
              <span style="color: #4ECDC4;">🏢 Jobs:</span> <span style="color: #ffffff; font-weight: bold;">${data.value}</span>
            </div>
            <div style="margin: 8px 0;">
              <span style="color: #FF6B6B;">🌍 Market Share:</span> <span style="color: #ffffff; font-weight: bold;">${percentage}%</span>
            </div>
          </div>
        `
      }
    },
    grid: {
      left: '25%',
      right: '8%',
      bottom: '10%',
      top: '18%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: 'Number of Jobs',
      nameLocation: 'middle',
      nameGap: 30,
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
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)',
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
      data: countryData.map(country => {
        const flag = countryFlags[country.country] || '🌍'
        return `${flag} ${country.country}`
      }),
      axisLabel: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: 'bold',
        width: 120,
        overflow: 'truncate'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)',
          width: 1
        }
      },
      axisTick: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      }
    },
    series: [
      {
        name: 'Job Distribution',
        type: 'bar',
        data: countryData.map((country, index) => ({
          value: country.count,
          name: country.country,
          flag: countryFlags[country.country] || '🌍',
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
                  color: colors[index % colors.length]
                },
                {
                  offset: 0.5,
                  color: colors[index % colors.length] + 'CC'
                },
                {
                  offset: 1,
                  color: colors[index % colors.length] + '88'
                }
              ]
            },
            borderRadius: [0, 8, 8, 0]
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
            const percentage = ((params.value / jobs.length) * 100).toFixed(1)
            return `${params.value} (${percentage}%)`
          }
        },
        barMaxWidth: 30
      }
    ],
    animation: true,
    animationDuration: 2000,
    animationEasing: 'elasticOut',
    animationDelay: function (idx: number) {
      return idx * 120
    }
  }

  return (
    <div style={{ 
      textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(90, 30, 60, 0.8) 100%)',
      borderRadius: '16px',
      padding: '24px',
      margin: '16px 0',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 20px 40px rgba(255, 107, 107, 0.2)'
    }}>
      <ReactECharts 
        option={option} 
        style={{ height: '700px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
      
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginTop: '24px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{ 
          flex: 1,
          minWidth: '300px',
          padding: '20px',
          background: 'rgba(255, 107, 107, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <h4 style={{ 
            color: '#FF6B6B', 
            marginBottom: '12px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            🌍 Market Intelligence
          </h4>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            lineHeight: '1.6',
            fontSize: '13px',
            margin: 0
          }}>
            Identify high-opportunity geographic markets and understand regional client distribution patterns. 
            Target regions with strong client presence for maximum proposal success rates.
          </p>
        </div>
        
        <div style={{ 
          flex: 1,
          minWidth: '300px',
          padding: '20px',
          background: 'rgba(78, 205, 196, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(78, 205, 196, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <h4 style={{ 
            color: '#4ECDC4', 
            marginBottom: '12px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            🎯 Geographic Strategy
          </h4>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            lineHeight: '1.6',
            fontSize: '13px',
            margin: 0
          }}>
            Leverage geographic insights to tailor your services, adjust pricing for regional markets, 
            and build specialized expertise in dominant client regions for competitive advantage.
          </p>
        </div>
      </div>
    </div>
  )
} 