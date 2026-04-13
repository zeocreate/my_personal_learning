import { GlobalSearch } from './GlobalSearch';
import { Bell, User, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Link } from 'react-router-dom';
import { LearningTrackerControls } from '@/components/LearningTrackerControls';

export function Topbar() {
  const { theme, toggle } = useTheme();

  return (
    <header className="min-h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 py-2 gap-3 shrink-0">
      <GlobalSearch />
      <LearningTrackerControls />
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
        </button>
        <Link to="/profile" className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors">
          <User className="h-4 w-4 text-primary" />
        </Link>
      </div>
    </header>
  );
}
