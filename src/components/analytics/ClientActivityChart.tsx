'use client'

import ReactECharts from 'echarts-for-react'
import { ScrapedJob } from '@/lib/supabase'
import { useState } from 'react'

interface ClientActivityChartProps {
  jobs: ScrapedJob[]
}

export default function ClientActivityChart({ jobs }: ClientActivityChartProps) {
  const [analysisMode, setAnalysisMode] = useState<'premium' | 'all' | 'competitive'>('all')
  const [viewType, setViewType] = useState<'opportunity' | 'skills' | 'countries'>('opportunity')

  // Enhanced opportunity analysis based on actual data format
  const analyzeOpportunity = (job: ScrapedJob) => {
    let budgetScore = 0
    let clientQualityScore = 0
    let competitionLevel = 50
    let urgencyScore = 0
    
    // Budget Analysis - Handle ranges like "$28.00 - $56.00"
    if (job.budget_amount) {
      // Handle hourly ranges
      const hourlyRangeMatch = job.budget_amount.match(/\$?([\d.]+)\s*-\s*\$?([\d.]+)/)
      if (hourlyRangeMatch) {
        const minRate = parseFloat(hourlyRangeMatch[1])
        const maxRate = parseFloat(hourlyRangeMatch[2])
        const avgRate = (minRate + maxRate) / 2
        
        if (avgRate >= 75) budgetScore = 100
        else if (avgRate >= 50) budgetScore = 90
        else if (avgRate >= 35) budgetScore = 80
        else if (avgRate >= 25) budgetScore = 70
        else if (avgRate >= 18) budgetScore = 60
        else if (avgRate >= 12) budgetScore = 50
        else if (avgRate >= 8) budgetScore = 40
        else budgetScore = 30
      } else {
        // Handle single values or fixed prices
        const singleMatch = job.budget_amount.match(/\$?([\d,]+)/)
        if (singleMatch) {
          const amount = parseFloat(singleMatch[1].replace(/,/g, ''))
          if (amount >= 5000) budgetScore = 100
          else if (amount >= 2000) budgetScore = 85
          else if (amount >= 1000) budgetScore = 70
          else if (amount >= 500) budgetScore = 55
          else budgetScore = 40
        }
      }
    }
    
    // Client Quality Analysis - Handle actual data formats
    if (job.client_total_spent) {
      const spentMatch = job.client_total_spent.match(/\$?([\d,]+)/)
      if (spentMatch) {
        const spent = parseFloat(spentMatch[1].replace(/,/g, ''))
        
        if (spent >= 200000) clientQualityScore += 50
        else if (spent >= 100000) clientQualityScore += 45
        else if (spent >= 50000) clientQualityScore += 40
        else if (spent >= 25000) clientQualityScore += 35
        else if (spent >= 10000) clientQualityScore += 30
        else if (spent >= 5000) clientQualityScore += 25
        else if (spent >= 1000) clientQualityScore += 20
        else if (spent >= 500) clientQualityScore += 15
        else clientQualityScore += 10
      }
    }
    
    // Client hire rate (already as percentage like "100.0")
    if (job.client_hire_rate) {
      const rate = parseFloat(job.client_hire_rate)
      if (rate >= 90) clientQualityScore += 25
      else if (rate >= 75) clientQualityScore += 20
      else if (rate >= 60) clientQualityScore += 15
      else if (rate >= 40) clientQualityScore += 10
      else if (rate >= 20) clientQualityScore += 5
    }
    
    // Client rating (scale 0-5)
    if (job.client_rating) {
      if (job.client_rating >= 4.8) clientQualityScore += 20
      else if (job.client_rating >= 4.5) clientQualityScore += 15
      else if (job.client_rating >= 4.0) clientQualityScore += 10
      else if (job.client_rating >= 3.5) clientQualityScore += 5
    }
    
    // Payment verification
    if (job.payment_method_verified === true) clientQualityScore += 10
    
    // Client experience from total hires
    if (job.client_total_hires) {
      const hiresMatch = job.client_total_hires.match(/([\d,]+)/)
      if (hiresMatch) {
        const hires = parseInt(hiresMatch[1].replace(/,/g, ''))
        if (hires >= 100) clientQualityScore += 15
        else if (hires >= 50) clientQualityScore += 12
        else if (hires >= 25) clientQualityScore += 10
        else if (hires >= 10) clientQualityScore += 8
        else if (hires >= 5) clientQualityScore += 5
        else if (hires >= 1) clientQualityScore += 3
      }
    }
    
    // Competition Analysis - Handle formats like "50+", "15 to 20", "Less than 5"
    if (job.proposals_count) {
      const proposalsStr = job.proposals_count.toLowerCase()
      
      if (proposalsStr.includes('50+') || proposalsStr.includes('more than 50')) {
        competitionLevel = 95
      } else if (proposalsStr.includes('less than 5')) {
        competitionLevel = 20
      } else {
        // Handle ranges like "15 to 20", "20 to 50"
        const rangeMatch = proposalsStr.match(/([\d]+)\s*to\s*([\d]+)/)
        if (rangeMatch) {
          const avgProposals = (parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2
          if (avgProposals >= 40) competitionLevel = 90
          else if (avgProposals >= 25) competitionLevel = 75
          else if (avgProposals >= 15) competitionLevel = 60
          else if (avgProposals >= 10) competitionLevel = 45
          else if (avgProposals >= 5) competitionLevel = 30
          else competitionLevel = 20
        } else {
          // Handle single numbers
          const singleMatch = proposalsStr.match(/([\d]+)/)
          if (singleMatch) {
            const proposals = parseInt(singleMatch[1])
            if (proposals >= 50) competitionLevel = 95
            else if (proposals >= 30) competitionLevel = 80
            else if (proposals >= 20) competitionLevel = 65
            else if (proposals >= 10) competitionLevel = 45
            else if (proposals >= 5) competitionLevel = 30
            else competitionLevel = 20
          }
        }
      }
    }
    
    // Connects required (affects competition)
    if (job.connects_required) {
      const connects = parseInt(job.connects_required)
      if (connects >= 20) competitionLevel += 10
      else if (connects >= 15) competitionLevel += 7
      else if (connects >= 10) competitionLevel += 5
      else if (connects >= 6) competitionLevel += 3
    }
    
    // Urgency based on posted date
    if (job.posted_date) {
      try {
        const posted = new Date(job.posted_date)
        const now = new Date()
        const daysSincePosted = (now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24)
        
        if (daysSincePosted <= 1) urgencyScore = 20
        else if (daysSincePosted <= 3) urgencyScore = 15
        else if (daysSincePosted <= 7) urgencyScore = 10
        else if (daysSincePosted <= 14) urgencyScore = 5
        else urgencyScore = 0
      } catch (e) {
        urgencyScore = 0
      }
    }
    
    // Experience level bonus
    let experienceBonus = 0
    if (job.experience_level) {
      if (job.experience_level.toLowerCase().includes('expert')) experienceBonus = 10
      else if (job.experience_level.toLowerCase().includes('intermediate')) experienceBonus = 5
    }
    
    // Calculate final scores with better balancing
    const totalBudgetScore = Math.min(100, budgetScore)
    const totalClientScore = Math.min(100, clientQualityScore + experienceBonus)
    const totalCompetition = Math.min(100, competitionLevel)
    
    const overallScore = (totalBudgetScore * 0.4) + (totalClientScore * 0.4) + (urgencyScore * 0.2)
    const successProbability = Math.max(5, Math.min(95, (overallScore * 0.7) + ((100 - totalCompetition) * 0.3)))
    const opportunityValue = (totalBudgetScore * 0.6) + (totalClientScore * 0.4)
    
    return {
      budgetScore: totalBudgetScore,
      clientQualityScore: totalClientScore,
      competitionLevel: totalCompetition,
      urgencyScore,
      overallScore,
      successProbability,
      opportunityValue,
      qualityTier: overallScore >= 75 ? 'premium' : overallScore >= 55 ? 'good' : overallScore >= 35 ? 'decent' : 'basic'
    }
  }

  // Extract skills with better parsing
  const extractSkills = (job: ScrapedJob) => {
    const skillsSet = new Set<string>()
    
    // Skill categories for classification
    const skillCategories = {
      'Frontend': ['React', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Responsive Design', 'Web Design'],
      'Backend': ['Node.js', 'Python', 'PHP', 'Java', 'C#', 'Ruby', 'Spring Framework', 'Spring Boot', 'RESTful API'],
      'Mobile': ['iOS', 'Android', 'React Native', 'Flutter', 'Swift', 'Kotlin', 'Mobile App Development'],
      'Blockchain': ['Blockchain', 'Smart Contract', 'Ethereum', 'Solidity', 'Web3', 'NFT', 'Cryptocurrency'],
      'AI/ML': ['Artificial Intelligence', 'Machine Learning', 'Python', 'Data Science', 'OpenAI API'],
      'Design': ['UI/UX', 'Figma', 'Adobe', 'Photoshop', 'Wireframing', 'Prototyping', 'User Experience Design'],
      'DevOps': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'API Integration'],
      'Data': ['Database', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Airtable'],
      'Other': ['WordPress', 'Shopify', 'E-commerce', 'CMS', 'API']
    }
    
    // Parse skills JSON array
    if (job.skills) {
      try {
        let skillsData = typeof job.skills === 'string' ? JSON.parse(job.skills) : job.skills
        if (Array.isArray(skillsData)) {
          skillsData.forEach((skill: any) => {
            if (typeof skill === 'string' && skill.trim()) {
              skillsSet.add(skill.trim())
            }
          })
        }
      } catch (e) {
        console.log('Error parsing skills:', e)
      }
    }
    
    // Extract from title and description
    const text = `${job.title || ''} ${job.description || ''}`.toLowerCase()
    Object.entries(skillCategories).forEach(([category, skills]) => {
      skills.forEach(skill => {
        if (text.includes(skill.toLowerCase())) {
          skillsSet.add(skill)
        }
      })
    })
    
    const skillsArray = Array.from(skillsSet)
    const primaryCategory = Object.entries(skillCategories).find(([category, skills]) => 
      skills.some(skill => skillsArray.some(jobSkill => jobSkill.toLowerCase().includes(skill.toLowerCase())))
    )?.[0] || 'General'
    
    return {
      skills: skillsArray,
      primaryCategory,
      primarySkill: skillsArray[0] || 'General'
    }
  }

  // Process opportunities with more lenient filtering
  const processOpportunities = () => {
    const opportunities: any[] = []
    
    console.log('Processing', jobs.length, 'jobs')
    
    jobs.forEach((job, index) => {
      const analysis = analyzeOpportunity(job)
      const skillData = extractSkills(job)
      
      console.log(`Job ${index + 1}:`, {
        title: job.title,
        budget: job.budget_amount,
        proposals: job.proposals_count,
        overallScore: analysis.overallScore,
        qualityTier: analysis.qualityTier
      })
      
      // More lenient filtering
      const shouldInclude = 
        analysisMode === 'all' ? analysis.overallScore >= 15 :
        analysisMode === 'premium' ? analysis.overallScore >= 60 :
        analysisMode === 'competitive' ? analysis.competitionLevel <= 70 : false
      
      if (shouldInclude) {
        opportunities.push({
          id: job.id,
          title: job.title,
          country: job.client_location || 'Worldwide',
          budget: job.budget_amount || 'Not specified',
          ...skillData,
          ...analysis,
          x: analysis.successProbability,
          y: analysis.opportunityValue,
          size: Math.max(10, analysis.overallScore * 0.8)
        })
      }
    })
    
    console.log(`Found ${opportunities.length} opportunities after filtering`)
    return opportunities
  }

  const opportunities = processOpportunities()

  // Aggregate opportunities by country or skill based on view type
  const getChartData = () => {
    if (viewType === 'opportunity') {
      return opportunities
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, 50) // Top 50 opportunities
    }
    
    const aggregationKey = viewType === 'skills' ? 'primaryCategory' : 'country'
    const aggregated = opportunities.reduce((acc, op) => {
      const key = op[aggregationKey]
      if (!acc[key]) {
        acc[key] = {
          name: key,
          count: 0,
          avgSuccess: 0,
          avgValue: 0,
          avgScore: 0,
          avgCompetition: 0,
          opportunities: []
        }
      }
      
      acc[key].count++
      acc[key].avgSuccess = (acc[key].avgSuccess * (acc[key].count - 1) + op.successProbability) / acc[key].count
      acc[key].avgValue = (acc[key].avgValue * (acc[key].count - 1) + op.opportunityValue) / acc[key].count
      acc[key].avgScore = (acc[key].avgScore * (acc[key].count - 1) + op.overallScore) / acc[key].count
      acc[key].avgCompetition = (acc[key].avgCompetition * (acc[key].count - 1) + op.competitionLevel) / acc[key].count
      acc[key].opportunities.push(op)
      
      return acc
    }, {} as Record<string, any>)
    
    return Object.values(aggregated)
      .filter((item: any) => item.count >= 1)
      .map((item: any) => ({
        ...item,
        x: item.avgSuccess,
        y: item.avgValue,
        size: Math.max(15, item.count * 4 + item.avgScore * 0.3),
        competition: item.avgCompetition
      }))
      .sort((a: any, b: any) => b.y - a.y)
      .slice(0, 30)
  }

  const chartData = getChartData()
  console.log('Chart data:', chartData)
  console.log('Chart data length:', chartData.length)
  console.log('Sample data point:', chartData[0])

  // Create chart options with fixed bubble sizing
  const option = {
    title: {
      text: `Premium Opportunity Map - ${viewType.charAt(0).toUpperCase() + viewType.slice(1)} View`,
      subtext: `${opportunities.length} opportunities analyzed in ${analysisMode} mode`,
      left: 'center',
      textStyle: {
        fontSize: 20,
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
        color: '#ffffff'
      },
      formatter: function(params: any) {
        const data = params.data
        if (viewType === 'opportunity') {
          return `
            <div style="padding: 12px; max-width: 300px;">
              <strong style="color: #3ecf8e;">${data.title || 'Untitled'}</strong><br/>
              <span style="color: #60a5fa;">📍 Location:</span> ${data.country}<br/>
              <span style="color: #f59e0b;">💰 Budget:</span> ${data.budget}<br/>
              <span style="color: #8b5cf6;">🎯 Skill:</span> ${data.primarySkill}<br/>
              <hr style="border-color: rgba(255,255,255,0.2); margin: 8px 0;"/>
              <span style="color: #10b981;">✅ Success Probability:</span> ${data.x.toFixed(0)}%<br/>
              <span style="color: #f59e0b;">🔥 Opportunity Value:</span> ${data.y.toFixed(0)}/100<br/>
              <span style="color: #ec4899;">⚔️ Competition:</span> ${data.competitionLevel.toFixed(0)}/100<br/>
              <span style="color: #3ecf8e;">⭐ Quality Tier:</span> ${data.qualityTier.toUpperCase()}
            </div>
          `
        } else {
          return `
            <div style="padding: 12px;">
              <strong style="color: #3ecf8e;">${data.name}</strong><br/>
              <span style="color: #8b5cf6;">📊 Available Jobs:</span> ${data.count}<br/>
              <span style="color: #60a5fa;">✅ Avg Success Rate:</span> ${data.x.toFixed(0)}%<br/>
              <span style="color: #f59e0b;">🔥 Avg Opportunity Value:</span> ${data.y.toFixed(0)}/100<br/>
              <span style="color: #ec4899;">⚔️ Avg Competition:</span> ${data.competition.toFixed(0)}/100
            </div>
          `
        }
      }
    },
    legend: {
      show: false
    },
    grid: {
      left: '8%',
      right: '8%',
      bottom: '20%',
      top: '20%'
    },
    xAxis: {
      type: 'value',
      name: 'Success Probability (%)',
      nameLocation: 'middle',
      nameGap: 35,
      nameTextStyle: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold'
      },
      min: 0,
      max: 100,
      axisLabel: {
        color: '#ffffff',
        formatter: '{value}%'
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
      type: 'value',
      name: 'Opportunity Value',
      nameLocation: 'middle',
      nameGap: 45,
      nameTextStyle: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold'
      },
      min: 0,
      max: 100,
      axisLabel: {
        color: '#ffffff'
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
    visualMap: {
      type: 'continuous',
      dimension: 3,
      min: 0,
      max: 100,
      calculable: true,
      realtime: false,
      inRange: {
        color: ['#10b981', '#3ecf8e', '#f59e0b', '#ef4444']
      },
      text: ['High Competition', 'Low Competition'],
      textStyle: {
        color: '#ffffff'
      },
      orient: 'horizontal',
      left: 'center',
      bottom: '8%'
    },
    series: [{
      type: 'scatter',
      data: chartData.map((item: any, index: number) => {
        // Ensure we have valid numbers with fallbacks
        const x = isNaN(item.x) ? 50 : Math.max(0, Math.min(100, item.x))
        const y = isNaN(item.y) ? 50 : Math.max(0, Math.min(100, item.y))
        const size = isNaN(item.size) ? 20 : Math.max(15, item.size)
        const competition = isNaN(item.competition || item.competitionLevel) ? 50 : (item.competition || item.competitionLevel)
        
        console.log(`Data point ${index + 1}:`, {
          name: viewType === 'opportunity' ? item.title : item.name,
          x, y, size, competition,
          original: { x: item.x, y: item.y, size: item.size }
        })
        
        return {
          name: viewType === 'opportunity' ? item.title : item.name,
          value: [x, y, size, competition],
          symbolSize: 25, // Fixed size for debugging
          ...item
        }
      }),
      symbolSize: function(data: any) {
        const calculatedSize = Math.min(40, Math.max(15, data[2] * 0.5))
        console.log('Symbol size calculation:', data[2], '->', calculatedSize)
        return calculatedSize
      },
      emphasis: {
        focus: 'series',
        scale: 1.3
      },
      itemStyle: {
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 2,
        opacity: 0.9
      }
    }]
  }

  if (opportunities.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="section-header">Premium Opportunity Map</h3>
          <p className="section-subtitle">Advanced opportunity analysis with strategic insights</p>
        </div>
        
        <div className="clean-card p-8 text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-accent mb-2">No Opportunities Found</h3>
          <p className="text-muted">Try adjusting the analysis mode or check if job data is available.</p>
          <p className="text-muted text-sm mt-2">Analyzing {jobs.length} total jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="section-header">Premium Opportunity Map</h3>
        <p className="section-subtitle">Strategic opportunity analysis with multi-dimensional insights</p>
      </div>
      
      {/* Control Panel */}
      <div className="clean-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-secondary mb-3 block">Analysis Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'all', label: 'All Jobs', icon: '📊' },
                { key: 'premium', label: 'Premium Only', icon: '💎' },
                { key: 'competitive', label: 'Low Competition', icon: '🎯' }
              ].map(mode => (
                <button
                  key={mode.key}
                  onClick={() => setAnalysisMode(mode.key as any)}
                  className={`clean-button text-xs px-3 py-2 ${analysisMode === mode.key ? 'bg-accent/20 border-accent/50' : ''}`}
                >
                  {mode.icon} {mode.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-secondary mb-3 block">View Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'opportunity', label: 'Individual', icon: '🎯' },
                { key: 'skills', label: 'By Skills', icon: '🛠️' },
                { key: 'countries', label: 'By Location', icon: '🌍' }
              ].map(view => (
                <button
                  key={view.key}
                  onClick={() => setViewType(view.key as any)}
                  className={`clean-button text-xs px-3 py-2 ${viewType === view.key ? 'bg-accent/20 border-accent/50' : ''}`}
                >
                  {view.icon} {view.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container">
        <ReactECharts 
          option={option} 
          style={{ height: '700px', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>

      {/* Strategy Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">🎯 Strategy Quadrants</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <span className="text-green-400">🟢</span>
              <div>
                <strong className="text-secondary">Top-Right (Sweet Spot):</strong>
                <p className="text-muted">High success probability + High value. Apply immediately!</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-blue-400">🔵</span>
              <div>
                <strong className="text-secondary">Top-Left (High Value, Lower Success):</strong>
                <p className="text-muted">Worth applying with strong proposals. High competition but good rewards.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-yellow-400">🟡</span>
              <div>
                <strong className="text-secondary">Bottom-Right (Easy Wins):</strong>
                <p className="text-muted">Lower value but high success rate. Good for building portfolio.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-red-400">🔴</span>
              <div>
                <strong className="text-secondary">Bottom-Left (Avoid):</strong>
                <p className="text-muted">Low value and low success rate. Skip these opportunities.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="clean-card p-6">
          <h4 className="text-lg font-semibold text-accent mb-4">📈 Key Insights</h4>
          <div className="space-y-4 text-sm">
            <div className="stats-card">
              <div className="text-xs text-muted mb-1">Total Opportunities</div>
              <div className="text-xl font-semibold text-accent">{opportunities.length}</div>
              <div className="text-xs text-muted">of {jobs.length} jobs</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="stats-card">
                <div className="text-xs text-muted mb-1">Premium Jobs</div>
                <div className="text-lg font-semibold text-secondary">
                  {opportunities.filter(o => o.qualityTier === 'premium').length}
                </div>
              </div>
              <div className="stats-card">
                <div className="text-xs text-muted mb-1">Low Competition</div>
                <div className="text-lg font-semibold text-secondary">
                  {opportunities.filter(o => o.competitionLevel <= 40).length}
                </div>
              </div>
            </div>
            
            <p className="text-muted leading-relaxed">
              Focus on large, green bubbles in the top-right quadrant for the best opportunities. 
              Bubble size indicates overall opportunity score.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 