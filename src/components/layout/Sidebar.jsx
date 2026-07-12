import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Library, ClipboardList, TrendingUp, Bot, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/study-room', icon: Bot, label: 'AI Study Room' },
  { to: '/planner', icon: ClipboardList, label: 'Planner' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
];

export function Sidebar({ collapsed, onToggle }) {
  const { user } = useAuth();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen z-40 transition-all duration-300',
        'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl',
        'border-r border-gray-200/50 dark:border-gray-700/50',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        <div className={cn(
          'flex items-center px-4 h-16 border-b border-gray-200/50 dark:border-gray-700/50',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                StudyCat
              </span>
            </div>
          )}
          {collapsed && (
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
                collapsed && 'justify-center px-2'
              )}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0')} />
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {collapsed && (
          <div className="px-3 py-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={onToggle}
              className="flex items-center justify-center w-full p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
          {!collapsed && user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 text-white text-sm font-medium">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Sem {user.semester} - {user.branch}
                </p>
              </div>
            </div>
          )}
          {collapsed && user && (
            <div className="flex items-center justify-center">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 text-white text-sm font-medium">
                {user.name?.charAt(0) || 'U'}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}