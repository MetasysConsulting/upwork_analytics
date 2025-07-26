'use client'

import React, { useState, useEffect } from 'react'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Paper,
  useTheme,
  useMediaQuery,
  Collapse,
  Stack,
} from '@mui/material'
import {
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
  PieChart as PieChartIcon,
  Public as PublicIcon,
  AttachMoney as AttachMoneyIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Psychology as PsychologyIcon,
  ShowChart as ActivityIcon,
  Analytics as AnalyticsIcon,

  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material'
import { useThemeMode } from '../app/mui-theme-provider'

interface MaterialSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  jobCount: number
  open?: boolean
  onToggle?: () => void
}

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  color: string
  description: string
  badge?: string
}

export default function MaterialSidebar({
  activeTab,
  onTabChange,
  jobCount,
  open = true,
  onToggle
}: MaterialSidebarProps) {
  const theme = useTheme()
  const { mode } = useThemeMode()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true)
    }
  }, [isMobile])

  const navigationItems: NavigationItem[] = [
    {
      id: 'jobs',
      label: 'Job Opportunities',
      icon: WorkIcon,
      color: theme.palette.primary.main,
      description: 'Browse latest opportunities',
      badge: String(jobCount),
    },
    {
      id: 'jobs-over-time',
      label: 'Market Trends',
      icon: TimelineIcon,
      color: theme.palette.info.main,
      description: 'Job posting trends',
    },
    {
      id: 'premium-map',
      label: 'Premium Opportunity Map',
      icon: AssessmentIcon,
      color: theme.palette.success.main,
      description: 'Strategic opportunity analysis',
    },
    {
      id: 'budget-analysis',
      label: 'Rate Intelligence',
      icon: PieChartIcon,
      color: theme.palette.warning.main,
      description: 'Competitive rate distribution',
    },
    {
      id: 'client-countries',
      label: 'Global Markets',
      icon: PublicIcon,
      color: theme.palette.secondary.main,
      description: 'Geographic distribution',
    },
    {
      id: 'client-spending',
      label: 'Client Investment',
      icon: AttachMoneyIcon,
      color: theme.palette.success.main,
      description: 'Spending patterns',
    },
    {
      id: 'client-hire-rate',
      label: 'Rate Intelligence',
      icon: TrendingUpIcon,
      color: '#f59e0b',
      description: 'Competitive rate analysis',
    },
    {
      id: 'client-hourly-rate',
      label: 'Hourly Insights',
      icon: AttachMoneyIcon,
      color: '#10b981',
      description: 'Hourly rate trends',
    },
    {
      id: 'interview-rate',
      label: 'Interview Insights',
      icon: AssessmentIcon,
      color: '#f59e0b',
      description: 'Interview success rates',
    },
    {
      id: 'skills-demand',
      label: 'Skill Intelligence',
      icon: PsychologyIcon,
      color: '#8b5cf6',
      description: 'In-demand skills',
    },
    {
      id: 'posting-heatmap',
      label: 'Activity Pulse',
      icon: ActivityIcon,
      color: '#06b6d4',
      description: 'Data collection patterns',
    },
  ]

  const handleItemClick = (itemId: string) => {
    onTabChange(itemId)
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {!collapsed && (
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.3)',
                  width: 40,
                  height: 40,
                }}
              >
                <AnalyticsIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  Upwork Analytics
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Market Intelligence
                </Typography>
              </Box>
            </Stack>
          )}
          
          <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <IconButton
              size="small"
              onClick={() => setCollapsed(!collapsed)}
              sx={{ 
                transition: 'all 0.2s ease',
                transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            >
              {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Live Data Banner */}
        {!collapsed && (
          <Paper
            sx={{
              mt: 2,
              p: 1.5,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
              border: `1px solid ${theme.palette.success.main}20`,
              borderRadius: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  backgroundColor: theme.palette.success.main,
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite',
                }}
              />
              <Typography variant="caption" color="text.primary" sx={{ fontWeight: 600 }}>
                Live Data
              </Typography>
              <Chip
                size="small"
                label={`${jobCount} jobs`}
                color="success"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.75rem' }}
              />
            </Stack>
          </Paper>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List disablePadding>
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <ListItem key={item.id} disablePadding>
                <Tooltip 
                  title={collapsed ? item.description : ''} 
                  placement="right"
                  arrow
                >
                  <ListItemButton
                    selected={isActive}
                    onClick={() => handleItemClick(item.id)}
                    sx={{
                      minHeight: 48,
                      px: 2,
                      mx: 1,
                      borderRadius: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? `${theme.palette.primary.main}20`
                          : `${theme.palette.primary.main}10`,
                        borderLeft: `3px solid ${theme.palette.primary.main}`,
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? `${theme.palette.primary.main}30`
                            : `${theme.palette.primary.main}15`,
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: collapsed ? 0 : 56 }}>
                      <Icon 
                        style={{ 
                          color: isActive ? theme.palette.primary.main : item.color,
                          fontSize: 20 
                        }} 
                      />
                    </ListItemIcon>
                    
                    {!collapsed && (
                      <>
                        <ListItemText
                          primary={item.label}
                          secondary={item.description}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? 'primary.main' : 'text.primary',
                          }}
                          secondaryTypographyProps={{
                            variant: 'caption',
                            color: 'text.secondary',
                          }}
                        />
                        
                        {item.badge && (
                          <Badge
                            badgeContent={item.badge}
                            color="primary"
                            variant="standard"
                            sx={{
                              '& .MuiBadge-badge': {
                                fontSize: '0.75rem',
                                height: 18,
                                minWidth: 18,
                              },
                            }}
                          />
                        )}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            )
          })}
        </List>
      </Box>


    </Box>
  )

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: collapsed ? 70 : 280,
          flexShrink: 0,
          transition: 'width 0.2s ease',
          '& .MuiDrawer-paper': {
            width: collapsed ? 70 : 280,
            boxSizing: 'border-box',
            transition: 'width 0.2s ease',
            overflowX: 'hidden',
          },
        }}
        open
      >
        {sidebarContent}
      </Drawer>

      {/* Mobile Menu Button */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1300,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[2],
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
    </>
  )
} 