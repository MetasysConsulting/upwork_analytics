'use client'

import ReactECharts from 'echarts-for-react'
import { ScrapedJob } from '@/lib/supabase'

interface SkillsDemandChartProps {
  jobs: ScrapedJob[]
}

export default function SkillsDemandChart({ jobs }: SkillsDemandChartProps) {
  // Extract skills from multiple sources
  const skillsCount: Record<string, number> = {}
  
  const commonSkills = [
    'React', 'JavaScript', 'Python', 'Node.js', 'TypeScript', 'PHP', 'Java', 'C#', 'C++',
    'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Docker', 'Kubernetes',
    'Git', 'REST API', 'GraphQL', 'WordPress', 'Shopify', 'Figma', 'Adobe', 'Photoshop',
    'Illustrator', 'UI/UX', 'Mobile', 'iOS', 'Android', 'Flutter', 'React Native',
    'Vue.js', 'Angular', 'Laravel', 'Django', 'Express', 'Next.js', 'Nuxt.js',
    'Machine Learning', 'AI', 'Data Science', 'Analytics', 'SEO', 'Marketing',
    'Content Writing', 'Translation', 'Video Editing', 'Animation', '3D Modeling',
    'Blockchain', 'Solidity', 'Smart Contracts', 'Web3', 'DevOps', 'CI/CD',
    'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'R', 'Tableau',
    'Power BI', 'Excel', 'Google Analytics', 'Facebook Ads', 'Google Ads'
  ]

  jobs.forEach(job => {
    // Use Set to track unique skills per job (no duplicates)
    const jobSkills = new Set<string>()
    
    // Define fields to search for skills
    const searchFields = [
      job.title || '',
      job.description || '',
      // Convert skills array to string for searching
      Array.isArray(job.skills) ? job.skills.join(' ') : (job.skills || '')
    ]
    
    // Combine all searchable text
    const searchText = searchFields.join(' ').toLowerCase()
    
    // Check for each skill in all fields
    commonSkills.forEach(skill => {
      const skillLower = skill.toLowerCase()
      
      // Check for exact skill matches (word boundaries)
      const skillPattern = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      
      if (skillPattern.test(searchText)) {
        jobSkills.add(skill)
      }
    })
    
    // Add found skills to count
    jobSkills.forEach(skill => {
      skillsCount[skill] = (skillsCount[skill] || 0) + 1
    })
  })

  // Sort skills by demand (count) and get top 15
  const topSkills = Object.entries(skillsCount)
    .map(([skill, count]) => ({
      skill,
      count,
      percentage: ((count / jobs.length) * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  // Vibrant color palette for dark mode
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', 
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#6C5CE7', '#FD79A8', '#FDCB6E', '#55A3FF', '#A29BFE'
  ]

  const option = {
    backgroundColor: '#0a0e1a',
    title: {
      text: '🎯 In-Demand Skills Analysis',
      subtext: `Market intelligence from ${topSkills.length} high-demand skills`,
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
          color: 'rgba(6, 182, 212, 0.1)'
        }
      },
      backgroundColor: 'rgba(15, 15, 35, 0.95)',
      borderColor: 'rgba(6, 182, 212, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff',
        fontSize: 14
      },
      formatter: function(params: any) {
        const data = params.data
        const percentage = ((data.value / jobs.length) * 100).toFixed(1)
        const demandLevel = data.value >= 15 ? 'High Demand' : 
                           data.value >= 8 ? 'Growing Demand' : 
                           data.value >= 4 ? 'Moderate Demand' : 'Emerging Skill'
        
        return `
          <div style="padding: 15px; border-radius: 8px; background: linear-gradient(135deg, ${data.itemStyle.color}15, ${data.itemStyle.color}05);">
            <div style="text-align: center; margin-bottom: 10px;">
              <span style="font-size: 24px;">🎯</span>
            </div>
            <strong style="color: ${data.itemStyle.color}; font-size: 16px; display: block; margin-bottom: 10px;">${data.name}</strong>
            <div style="margin: 8px 0;">
              <span style="color: #4ECDC4;">📊 Jobs Available:</span> <span style="color: #ffffff; font-weight: bold;">${data.value}</span>
            </div>
            <div style="margin: 8px 0;">
              <span style="color: #FF6B6B;">📈 Market Share:</span> <span style="color: #ffffff; font-weight: bold;">${percentage}%</span>
            </div>
            <div style="margin: 8px 0;">
              <span style="color: #A29BFE;">💡 ${demandLevel}</span>
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
      data: topSkills.map(skill => skill.skill),
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
        name: 'Job Count',
        type: 'bar',
        data: topSkills.map((skill, index) => ({
          value: skill.count,
          name: skill.skill,
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
      return idx * 100
    }
  }

  return (
    <div style={{ 
      textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(30, 30, 60, 0.8) 100%)',
      borderRadius: '16px',
      padding: '24px',
      margin: '16px 0',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
    }}>
      <ReactECharts 
        option={option} 
        style={{ height: '700px', width: '100%' }}
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
          color: '#4ECDC4', 
          marginBottom: '12px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          💡 Strategic Skills Intelligence
        </h4>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          lineHeight: '1.7',
          fontSize: '14px',
          margin: 0
        }}>
          This dynamic visualization reveals the most in-demand skills and technologies in the current job market. 
          Each skill is represented with vibrant gradients and precise market penetration data. Focus your learning 
          and development efforts on the top-ranking technologies to maximize your marketability and earning potential 
          in today's competitive landscape.
        </p>
      </div>
    </div>
  )
} 