import { useTheme } from '@mui/material/styles'

export const useChartTheme = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return {
    textColor: isDark ? '#ffffff' : '#1f2937',
    subtextColor: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
    axisColor: isDark ? '#ffffff' : '#374151',
    lineColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(55, 65, 81, 0.2)',
    splitLineColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(55, 65, 81, 0.1)',
    tooltipBg: isDark ? 'rgba(15, 15, 35, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    tooltipBorder: isDark ? 'rgba(62, 207, 142, 0.3)' : 'rgba(59, 130, 246, 0.3)',
    tooltipTextColor: isDark ? '#ffffff' : '#1f2937',
  }
} 