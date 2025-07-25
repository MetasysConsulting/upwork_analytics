'use client'

import ReactECharts from 'echarts-for-react'
import { ScrapedJob } from '@/lib/supabase'
import { format, parseISO, getDay, getHours } from 'date-fns'

interface JobPostingHeatmapProps {
  jobs: ScrapedJob[]
}

export default function JobPostingHeatmap({ jobs }: JobPostingHeatmapProps) {
  // Enhanced data processing with comprehensive analysis
  const processHeatmapData = () => {
    const heatmapData: number[][] = Array(7).fill(0).map(() => Array(24).fill(0))
    const dailyTotals = Array(7).fill(0)
    const hourlyTotals = Array(24).fill(0)
    let totalJobs = 0
    let validDates = 0

         jobs.forEach(job => {
       if (job.created_at) {
         try {
           const date = parseISO(job.created_at)
           const day = getDay(date) // 0 = Sunday, 1 = Monday, etc.
           const hour = getHours(date)
           
           heatmapData[day][hour]++
           dailyTotals[day]++
           hourlyTotals[hour]++
           totalJobs++
           validDates++
         } catch (error) {
           // Skip invalid dates
         }
       }
     })

    return { heatmapData, dailyTotals, hourlyTotals, totalJobs, validDates }
  }

  const { heatmapData, dailyTotals, hourlyTotals, totalJobs, validDates } = processHeatmapData()

  // Calculate strategic insights
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  // Find peak times
  const peakDay = dailyTotals.indexOf(Math.max(...dailyTotals))
  const peakHour = hourlyTotals.indexOf(Math.max(...hourlyTotals))
  const peakDayJobs = Math.max(...dailyTotals)
  const peakHourJobs = Math.max(...hourlyTotals)

  // Calculate business vs weekend activity
  const weekdayJobs = dailyTotals.slice(1, 6).reduce((sum, count) => sum + count, 0) // Mon-Fri
  const weekendJobs = dailyTotals[0] + dailyTotals[6] // Sun + Sat
  
  // Calculate business hours vs off-hours activity
  const businessHours = hourlyTotals.slice(9, 17).reduce((sum, count) => sum + count, 0) // 9AM-5PM
  const offHours = hourlyTotals.slice(0, 9).reduce((sum, count) => sum + count, 0) + 
                   hourlyTotals.slice(17, 24).reduce((sum, count) => sum + count, 0)

  // Convert to ECharts heatmap format with enhanced data
  const data: [number, number, number][] = []
  let maxActivity = 0
  
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const value = heatmapData[day][hour]
      if (value > 0) {
        data.push([hour, day, value])
        maxActivity = Math.max(maxActivity, value)
      }
    }
  }

  // Create time zone insights
  const createTimeZoneInsights = () => {
    const morningRush = hourlyTotals.slice(7, 11).reduce((sum, count) => sum + count, 0) // 7-11AM
    const lunchTime = hourlyTotals.slice(11, 14).reduce((sum, count) => sum + count, 0) // 11AM-2PM
    const afternoonRush = hourlyTotals.slice(14, 18).reduce((sum, count) => sum + count, 0) // 2-6PM
    const eveningActivity = hourlyTotals.slice(18, 22).reduce((sum, count) => sum + count, 0) // 6-10PM

    return { morningRush, lunchTime, afternoonRush, eveningActivity }
  }

  const timeZoneInsights = createTimeZoneInsights()

  const option = {
         title: {
       text: 'Data Collection Activity Heatmap',
       subtext: `Scraping activity analysis across ${validDates} job records`,
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
      position: 'top',
      backgroundColor: 'rgba(15, 15, 35, 0.95)',
      borderColor: 'rgba(62, 207, 142, 0.3)',
      borderWidth: 2,
      textStyle: {
        color: '#ffffff',
        fontSize: 13
      },
      formatter: function(params: any) {
        const day = weekdays[params.data[1]]
        const hour = params.data[0]
        const count = params.data[2]
        const percentage = ((count / totalJobs) * 100).toFixed(1)
        const hourLabel = hour === 0 ? '12:00 AM' : 
                         hour < 12 ? `${hour}:00 AM` : 
                         hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`
        
                 return `
           <div style="padding: 10px;">
             <strong style="color: #3ecf8e;">${day} at ${hourLabel}</strong><br/>
             <span style="color: #60a5fa;">📊 Jobs Scraped:</span> ${count}<br/>
             <span style="color: #f59e0b;">📈 Activity:</span> ${percentage}% of total<br/>
             <span style="color: #8b5cf6;">⏰ Timing:</span> ${count === peakHourJobs ? 'PEAK HOUR' : count === peakDayJobs ? 'PEAK DAY' : count > totalJobs / (7 * 24) ? 'High Activity' : 'Low Activity'}
           </div>
         `
      }
    },
    grid: {
      left: '8%',
      right: '15%',
      top: '18%',
      bottom: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: Array.from({length: 24}, (_, i) => {
        if (i === 0) return '12 AM'
        if (i < 12) return `${i} AM`
        if (i === 12) return '12 PM'
        return `${i - 12} PM`
      }),
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.05)']
        }
      },
      axisLabel: {
        color: '#ffffff',
        fontSize: 11,
        rotate: 45
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)'
        }
      },
      name: 'Hour of Day',
      nameLocation: 'middle',
      nameGap: 45,
      nameTextStyle: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    yAxis: {
      type: 'category',
      data: weekdays,
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.05)']
        }
      },
      axisLabel: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '500'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)'
        }
      },
      name: 'Day of Week',
      nameLocation: 'middle',
      nameGap: 60,
      nameTextStyle: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    visualMap: {
      min: 0,
      max: maxActivity,
      calculable: true,
      orient: 'vertical',
      right: '2%',
      top: '25%',
      bottom: '25%',
      inRange: {
        color: [
          'rgba(15, 15, 35, 0.3)',    // Very low activity
          'rgba(59, 130, 246, 0.4)',  // Low activity  
          'rgba(59, 130, 246, 0.6)',  // Medium activity
          'rgba(34, 197, 94, 0.7)',   // High activity
          'rgba(234, 179, 8, 0.8)',   // Very high activity
          'rgba(239, 68, 68, 0.9)',   // Peak activity
          'rgba(147, 51, 234, 1.0)'   // Maximum activity
        ]
      },
      textStyle: {
        color: '#ffffff',
        fontSize: 12
      },
      formatter: function(value: number) {
        if (value === 0) return 'No Activity'
        if (value === maxActivity) return `Peak (${value})`
        return value.toString()
      }
    },
         series: [
       {
         name: 'Jobs Scraped',
        type: 'heatmap',
        data: data,
        label: {
          show: true,
          fontSize: 11,
          color: '#ffffff',
          fontWeight: 'bold',
          formatter: function(params: any) {
            return params.data[2] > maxActivity * 0.3 ? params.data[2] : ''
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetY: -3,
            shadowColor: 'rgba(62, 207, 142, 0.5)',
            borderColor: 'rgba(255, 255, 255, 0.8)',
            borderWidth: 2
          },
          scale: 1.1
        },
        itemStyle: {
          borderRadius: 4,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1
        }
      }
    ],
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut'
  }

  if (totalJobs === 0) {
    return (
      <div className="space-y-6">
                 <div className="text-center">
           <h3 className="section-header">Data Collection Activity Heatmap</h3>
           <p className="section-subtitle">Analysis of when job data was scraped and collected</p>
         </div>
         
         <div className="clean-card p-8 text-center">
           <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           </div>
           <h3 className="text-xl font-semibold text-accent mb-2">No Collection Data</h3>
           <p className="text-muted">No job creation timestamps available for analysis.</p>
         </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
             <div className="text-center">
         <h3 className="section-header">Data Collection Activity Heatmap</h3>
         <p className="section-subtitle">Analysis of when job data was scraped and collected</p>
       </div>

      {/* Chart Container */}
      <div className="chart-container">
        <ReactECharts 
          option={option} 
          style={{ height: '700px', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>

      {/* Timing Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">⏰ Peak Times</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-secondary">Peak Day:</span>
              <span className="text-accent font-semibold">{weekdays[peakDay]}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary">Peak Hour:</span>
              <span className="text-secondary">
                {peakHour === 0 ? '12 AM' : peakHour < 12 ? `${peakHour} AM` : peakHour === 12 ? '12 PM' : `${peakHour - 12} PM`}
              </span>
            </div>
            <div className="flex justify-between items-center">
                             <span className="text-secondary">Max Activity:</span>
               <span className="text-secondary">{maxActivity} jobs</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-secondary">Total Scraped:</span>
               <span className="text-secondary">{validDates} jobs</span>
            </div>
          </div>
        </div>

        <div className="clean-card p-6">
                     <h4 className="text-lg font-semibold text-accent mb-4">📅 Scraping Patterns</h4>
           <div className="space-y-3 text-sm">
             <div className="flex justify-between items-center">
               <span className="text-secondary">Weekday Activity:</span>
               <span className="text-secondary">{weekdayJobs} jobs</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-secondary">Weekend Activity:</span>
               <span className="text-secondary">{weekendJobs} jobs</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-secondary">Work Days Ratio:</span>
               <span className="text-secondary">
                 {((weekdayJobs / totalJobs) * 100).toFixed(1)}%
               </span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-secondary">Peak Scraping Day:</span>
               <span className="text-accent font-semibold">{weekdays[peakDay]}</span>
             </div>
          </div>
        </div>

        <div className="clean-card p-6">
                     <h4 className="text-lg font-semibold text-accent mb-4">🕐 Hourly Analysis</h4>
           <div className="space-y-3 text-sm">
             <div className="flex justify-between items-center">
               <span className="text-secondary">Business Hours:</span>
               <span className="text-secondary">{businessHours} jobs</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-secondary">Off Hours:</span>
               <span className="text-secondary">{offHours} jobs</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-secondary">Morning Activity:</span>
               <span className="text-secondary">{timeZoneInsights.morningRush} jobs</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-secondary">Evening Activity:</span>
               <span className="text-secondary">{timeZoneInsights.eveningActivity} jobs</span>
             </div>
          </div>
        </div>

                 <div className="clean-card p-6">
           <h4 className="text-lg font-semibold text-accent mb-4">📊 Collection Insights</h4>
           <div className="space-y-2 text-sm text-muted">
             <p>• Most data collected on {weekdays[peakDay]}s</p>
             <p>• Peak collection time: {peakHour === 0 ? '12 AM' : peakHour < 12 ? `${peakHour} AM` : peakHour === 12 ? '12 PM' : `${peakHour - 12} PM`}</p>
             <p>• {businessHours > offHours ? 'Primarily collected during business hours' : 'Mixed timing collection'}</p>
             <p>• {weekdayJobs > weekendJobs * 2 ? 'Weekday-focused collection' : 'Includes weekend collection'}</p>
           </div>
         </div>
      </div>

      {/* Chart Explanation */}
             <div className="chart-explanation" style={{ maxWidth: '900px', margin: '0 auto' }}>
         <h4>📊 Understanding Data Collection Patterns</h4>
         <p>
           This heatmap shows when job data was scraped and added to your database. Darker areas indicate 
           higher collection activity during specific days and hours. This helps you understand your 
           data collection patterns and can be useful for optimizing scraping schedules or identifying 
           when your system was most active in gathering market intelligence.
         </p>
       </div>
    </div>
  )
} 