import { useThemeStore } from '@/store/themeStore'
import { Button } from '@/components/ui/button'

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore()
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === 'dark' ? '🌙' : '☀️'}
    </Button>
  )
}

export default ThemeToggle
