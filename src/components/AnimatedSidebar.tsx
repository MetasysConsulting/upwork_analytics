'use client'

import { useState, useEffect } from 'react'
import { 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  Lightbulb, 
  Map, 
  Globe, 
  CreditCard, 
  UserCheck, 
  Link, 
  MessageCircle, 
  Clock, 
  Activity,
  BarChart3,
  RefreshCw,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface AnimatedSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  jobCount: number
}

export default function AnimatedSidebar({ activeTab, onTabChange, jobCount }: AnimatedSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navigationItems = [
    { id: 'jobs', icon: Briefcase, label: 'Job Opportunities', badge: jobCount },
    { id: 'jobs-over-time', icon: TrendingUp, label: 'Jobs Over Time' },
    { id: 'budget-analysis', icon: DollarSign, label: 'Rate Distribution' },
    { id: 'skills-demand', icon: Lightbulb, label: 'Skills Demand' },
    { id: 'client-activity', icon: Activity, label: 'Client Activity' },
    { id: 'client-countries', icon: Globe, label: 'Client Countries' },
    { id: 'client-spending', icon: CreditCard, label: 'Client Spending' },
    { id: 'client-hire-rate', icon: UserCheck, label: 'Client Hire Rate' },
    { id: 'connects-required', icon: Link, label: 'Connects Required' },
    { id: 'interviewing-rate', icon: MessageCircle, label: 'Interview Success' },
    { id: 'client-hourly-rate', icon: Clock, label: 'Hourly Rates' },
    { id: 'job-heatmap', icon: BarChart3, label: 'Activity Heatmap' }
  ]

  // Close mobile menu when tab changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [activeTab])

  // Auto-collapse on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 sidebar-mobile-btn"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        sidebar-container
        ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}
        ${isMobileOpen ? 'sidebar-mobile-open' : 'sidebar-mobile-closed'}
      `}>
        {/* Logo Section */}
        <div className="sidebar-header">
          <div className="flex items-center gap-3">
            <div className="sidebar-logo">
              <BarChart3 className="w-6 h-6" />
            </div>
            {!isCollapsed && (
              <div className="sidebar-logo-text">
                <h1 className="text-lg font-bold text-white">Upwork Analytics</h1>
                <p className="text-xs text-muted">Market Intelligence</p>
              </div>
            )}
          </div>
          
          {/* Desktop Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex sidebar-collapse-btn"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-group">
            {!isCollapsed && <div className="sidebar-group-title">Analytics</div>}
            
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <div className="sidebar-nav-icon">
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {!isCollapsed && (
                    <div className="sidebar-nav-content">
                      <span className="sidebar-nav-label">{item.label}</span>
                      {item.badge && (
                        <span className="sidebar-nav-badge">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {isActive && <div className="sidebar-nav-indicator" />}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {!isCollapsed && (
            <div className="sidebar-status">
              <div className="flex items-center gap-2">
                <div className="sidebar-status-dot" />
                <span className="text-xs text-muted">Live Data</span>
              </div>
              <RefreshCw className="w-4 h-4 text-muted animate-spin-slow" />
            </div>
          )}
        </div>
      </div>
    </>
  )
} 