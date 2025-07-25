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
    
    // 1. Extract from skills JSONB column
    if (job.skills) {
      try {
        let skillsData = job.skills
        
        // Handle if skills is a string (parse it) or already an object
        if (typeof skillsData === 'string') {
          skillsData = JSON.parse(skillsData)
        }
        
        // Extract skills from various possible structures
        if (Array.isArray(skillsData)) {
          // Skills as array: ["React", "JavaScript", ...]
          skillsData.forEach((skill: any) => {
            if (typeof skill === 'string') {
              jobSkills.add(skill.trim())
            } else if (skill && skill.name) {
              jobSkills.add(skill.name.trim())
            }
          })
        } else if (typeof skillsData === 'object') {
          // Skills as object: { "frontend": ["React", "JS"], "backend": ["Node.js"] }
          Object.values(skillsData).forEach((categorySkills: any) => {
            if (Array.isArray(categorySkills)) {
              categorySkills.forEach((skill: any) => {
                if (typeof skill === 'string') {
                  jobSkills.add(skill.trim())
                } else if (skill && skill.name) {
                  jobSkills.add(skill.name.trim())
                }
              })
            }
          })
        }
      } catch (error) {
        console.log('Error parsing skills JSON:', error)
      }
    }
    
    // 2. Extract from title and description (text analysis)
    const text = `${job.title || ''} ${job.description || ''}`.toLowerCase()
    
    commonSkills.forEach(skill => {
      if (text.includes(skill.toLowerCase())) {
        jobSkills.add(skill)
      }
    })
    
    // 3. Count each unique skill found in this job
    jobSkills.forEach(skill => {
      // Normalize skill names (case-insensitive, handle variations)
      const normalizedSkill = normalizeSkillName(skill)
      if (normalizedSkill) {
        skillsCount[normalizedSkill] = (skillsCount[normalizedSkill] || 0) + 1
      }
    })
  })

  // Helper function to normalize skill names
  function normalizeSkillName(skill: string): string | null {
    const normalized = skill.trim()
    if (normalized.length < 2) return null
    
    // Handle common variations and aliases
    const skillMap: Record<string, string> = {
      'js': 'JavaScript',
      'javascript': 'JavaScript',
      'reactjs': 'React',
      'react.js': 'React',
      'nodejs': 'Node.js',
      'node': 'Node.js',
      'typescript': 'TypeScript',
      'ts': 'TypeScript',
      'html5': 'HTML',
      'css3': 'CSS',
      'postgresql': 'PostgreSQL',
      'postgres': 'PostgreSQL',
      'mysql': 'MySQL',
      'mongodb': 'MongoDB',
      'mongo': 'MongoDB',
      'aws': 'AWS',
      'amazon web services': 'AWS',
      'machine learning': 'Machine Learning',
      'ml': 'Machine Learning',
      'artificial intelligence': 'AI',
      'ui/ux': 'UI/UX',
      'user experience': 'UI/UX',
      'user interface': 'UI/UX'
    }
    
    const lowerSkill = normalized.toLowerCase()
    return skillMap[lowerSkill] || 
           normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase()
  }

  // Sort skills by frequency and take top 15
  const topSkills = Object.entries(skillsCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15)
    .map(([skill, count]) => ({ skill, count }))

  const option = {
    title: {
      text: 'Most Requested Skills & Technologies',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(15, 15, 35, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff'
      },
      formatter: function(params: any) {
        const data = params[0]
        return `${data.name}<br/>Demand: ${data.value} jobs`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: 'Number of Jobs',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        color: '#ffffff'
      },
      axisLabel: {
        color: '#ffffff'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
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
      data: topSkills.map(item => item.skill),
      axisLabel: {
        fontSize: 12,
        color: '#ffffff'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      }
    },
    series: [
      {
        name: 'Skill Demand',
        type: 'bar',
        data: topSkills.map(item => item.count),
        itemStyle: {
          color: function(params: any) {
            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
            return colors[params.dataIndex % colors.length]
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="mb-8">
        <h3 className="section-header">Most Requested Skills & Technologies</h3>
        <p className="section-subtitle">Top in-demand skills and technologies</p>
      </div>
      <ReactECharts 
        option={option} 
        style={{ height: '600px', margin: '0 auto' }}
        opts={{ renderer: 'canvas' }}
      />
      <div className="chart-explanation" style={{ maxWidth: '800px', margin: '0 auto', marginTop: '24px' }}>
        <h4>🛠️ What This Shows</h4>
        <p>This horizontal bar chart displays the most requested skills and technologies in job postings. Focus on developing expertise in the highest-demand skills to increase your marketability and earning potential.</p>
      </div>
    </div>
  )
} 