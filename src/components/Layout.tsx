import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky header with blur - matches bpog.cloud style */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-2xl shadow-sm" />
        <div className="relative max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">📊</span>
            <span className="font-medium text-base text-foreground hidden sm:inline">Latency Calculator</span>
          </NavLink>
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  cn(
                    'px-3 py-1.5 text-base font-medium transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  )
                }
              >
                Calculator
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  cn(
                    'px-3 py-1.5 text-base font-medium transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  )
                }
              >
                About
              </NavLink>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content with top padding for fixed header */}
      <main className="max-w-5xl mx-auto px-6 pt-24 pb-12">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-muted-foreground">
          Built to help understand how latency impacts file transfer performance
        </div>
      </footer>
    </div>
  );
}
