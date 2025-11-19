import { Activity, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';

export const Navigation = () => {
  const location = useLocation();

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">Quality Monitoring Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Travel System Quality Maturity Index</p>
            </div>
          </Link>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to="/settings">
              <Button
                variant={location.pathname === '/settings' ? 'default' : 'ghost'}
                size="icon"
                className="w-9 h-9"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};

// Fix the missing Button import
import { Button } from './ui/button';
