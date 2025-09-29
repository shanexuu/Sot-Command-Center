'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useSidebar } from '@/lib/sidebar-context'
import { useSidebarData } from '@/hooks/use-sidebar-data'
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  BarChart3,
  Bot,
  Target,
  Zap,
  X,
} from 'lucide-react'

const aiTools = [
  {
    name: 'Profile Validator',
    href: '/ai/student-validator',
    icon: Bot,
    description: 'AI-powered student profile validation',
  },
  {
    name: 'Job Enhancer',
    href: '/ai/job-enhancer',
    icon: Zap,
    description: 'Enhance job postings with AI',
  },
  {
    name: 'Matchmaking',
    href: '/ai/matchmaking',
    icon: Target,
    description: 'Smart student-employer matching',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, closeSidebar } = useSidebar()
  const { data: sidebarData, loading } = useSidebarData()

  // Create dynamic navigation with real data
  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Students',
      href: '/students',
      icon: Users,
      badge:
        sidebarData.students.total > 0
          ? sidebarData.students.total.toString()
          : null,
    },
    {
      name: 'Employers',
      href: '/employers',
      icon: Building2,
      badge:
        sidebarData.employers.total > 0
          ? sidebarData.employers.total.toString()
          : null,
    },
    {
      name: 'Job Postings',
      href: '/jobs',
      icon: Briefcase,
      badge:
        sidebarData.jobs.total > 0 ? sidebarData.jobs.total.toString() : null,
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      badge: null,
    },
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 ease-in-out',
          // Fixed positioning for all screen sizes
          'fixed inset-y-0 left-0 z-50',
          // Mobile: slide in/out, Desktop: always visible
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo - Fixed Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-6">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-sidebar-foreground">
                SoT Command
              </h1>
              <p className="text-xs text-muted-foreground">Center</p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1 rounded-md hover:bg-sidebar-accent transition-colors"
          >
            <X className="h-5 w-5 text-sidebar-foreground" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="space-y-1 p-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </div>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="bg-sidebar-accent text-sidebar-accent-foreground"
                      >
                        {loading ? '...' : item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* AI Tools Section */}
            <div className="pt-6">
              <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                AI Tools
              </h3>
              <div className="space-y-1">
                {aiTools.map((tool) => {
                  const isActive = pathname === tool.href
                  return (
                    <Link
                      key={tool.name}
                      href={tool.href}
                      className={cn(
                        'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <tool.icon className="mr-3 h-5 w-5" />
                      <div className="flex-1">
                        <div>{tool.name}</div>
                        <div
                          className={cn(
                            'text-xs',
                            isActive
                              ? 'text-sidebar-primary-foreground/80'
                              : 'text-muted-foreground'
                          )}
                        >
                          {tool.description}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  )
}
