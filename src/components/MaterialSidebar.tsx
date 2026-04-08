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
  Stack,
  Button,
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
  StarBorder as StarBorderIcon,
  Bolt as BoltIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material'
import { useThemeMode } from '../app/mui-theme-provider'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components'

interface MaterialSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  jobCount: number
  timeRange?: '1w' | '1m' | '3m' | '6m' | '1y'
  onTimeRangeChange?: (range: '1w' | '1m' | '3m' | '6m' | '1y') => void
  open?: boolean
  onToggle?: () => void
}

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ style?: React.CSSProperties }>
  color: string
  description: string
  badge?: string
}

export default function MaterialSidebar({
  activeTab,
  onTabChange,
  jobCount,
  timeRange = '3m',
  onTimeRangeChange,
}: MaterialSidebarProps) {
  const theme = useTheme()
  const { mode } = useThemeMode()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useKindeBrowserClient()

  useEffect(() => {
    if (isMobile) setCollapsed(true)
  }, [isMobile])

  const navigationItems: NavigationItem[] = [
    {
      id: 'jobs',
      label: 'Job Opportunities',
      icon: WorkIcon,
      color: theme.palette.primary.main,
      description: 'Browse latest opportunities',
      badge: jobCount > 0 ? (jobCount > 9999 ? `${Math.round(jobCount / 1000)}k+` : String(jobCount)) : undefined,
    },
    {
      id: 'high-profile-clients',
      label: 'High Profile Clients',
      icon: StarBorderIcon,
      color: '#22c55e',
      description: 'Top-tier client opportunities',
    },
    {
      id: 'jobs-over-time',
      label: 'Market Trends',
      icon: TimelineIcon,
      color: theme.palette.info.main,
      description: 'Job posting trends over time',
    },
    {
      id: 'premium-map',
      label: 'Premium Opportunity Map',
      icon: AssessmentIcon,
      color: theme.palette.success.main,
      description: 'Client spend vs. activity scatter',
    },
    {
      id: 'budget-analysis',
      label: 'Rate Intelligence',
      icon: PieChartIcon,
      color: theme.palette.warning.main,
      description: 'Fixed & hourly rate distribution',
    },
    {
      id: 'client-countries',
      label: 'Global Markets',
      icon: PublicIcon,
      color: theme.palette.secondary.main,
      description: 'Client geographic distribution',
    },
    {
      id: 'client-spending',
      label: 'Client Investment',
      icon: AttachMoneyIcon,
      color: theme.palette.success.main,
      description: 'Client spending patterns',
    },
    {
      id: 'client-hire-rate',
      label: 'Hiring Trends',
      icon: TrendingUpIcon,
      color: '#f59e0b',
      description: 'Client hire-rate analysis',
    },
    {
      id: 'connects-required',
      label: 'Connects Required',
      icon: BoltIcon,
      color: '#8b5cf6',
      description: 'Connects cost distribution',
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
      description: 'Extraction patterns by hour',
    },
  ]

  const handleItemClick = (itemId: string) => {
    onTabChange(itemId)
    if (isMobile) setMobileOpen(false)
  }

  const userInitial = user?.given_name?.[0] ?? user?.email?.[0]?.toUpperCase() ?? '?'
  const userDisplay = user?.given_name
    ? `${user.given_name} ${user.family_name ?? ''}`.trim()
    : user?.email ?? ''

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

          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <IconButton
              size="small"
              onClick={() => setCollapsed(!collapsed)}
              sx={{
                transition: 'all 0.2s ease',
                transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
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
              background:
                theme.palette.mode === 'dark'
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
                label={`${jobCount.toLocaleString()} jobs`}
                color="success"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.75rem' }}
              />
            </Stack>

            {onTimeRangeChange && (
              <Stack direction="row" spacing={0.75} sx={{ mt: 1.25, flexWrap: 'wrap', gap: 0.75 }}>
                {([
                  { id: '1w', label: '1W' },
                  { id: '1m', label: '1M' },
                  { id: '3m', label: '3M' },
                  { id: '6m', label: '6M' },
                  { id: '1y', label: '1Y' },
                ] as const).map((item) => (
                  <Chip
                    key={item.id}
                    size="small"
                    label={item.label}
                    clickable
                    color={timeRange === item.id ? 'primary' : 'default'}
                    variant={timeRange === item.id ? 'filled' : 'outlined'}
                    onClick={() => onTimeRangeChange(item.id)}
                    sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                  />
                ))}
              </Stack>
            )}
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
                <Tooltip title={collapsed ? item.description : ''} placement="right" arrow>
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
                        backgroundColor:
                          theme.palette.mode === 'dark'
                            ? `${theme.palette.primary.main}20`
                            : `${theme.palette.primary.main}10`,
                        borderLeft: `3px solid ${theme.palette.primary.main}`,
                        '&:hover': {
                          backgroundColor:
                            theme.palette.mode === 'dark'
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
                          fontSize: 20,
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

      {/* Footer — user info + sign out */}
      <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, p: collapsed ? 1 : 2 }}>
        {collapsed ? (
          <Tooltip title="Sign Out" placement="right" arrow>
            <IconButton
              size="small"
              component={LogoutLink}
              sx={{ color: 'text.secondary', mx: 'auto', display: 'flex' }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: '0.875rem',
                backgroundColor: theme.palette.primary.main,
                flexShrink: 0,
              }}
            >
              {userInitial}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {userDisplay}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
              >
                {user?.email}
              </Typography>
            </Box>
            <Tooltip title="Sign Out">
              <IconButton size="small" component={LogoutLink} sx={{ color: 'text.secondary', flexShrink: 0 }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Box>
    </Box>
  )

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
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
          onClick={() => setMobileOpen(!mobileOpen)}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1300,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[2],
            '&:hover': { backgroundColor: theme.palette.action.hover },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
    </>
  )
}
