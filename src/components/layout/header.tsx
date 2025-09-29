'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

import { Bell, Search, Menu } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useSidebar } from '@/lib/sidebar-context'
import { UserMenu } from '@/components/auth/user-menu'

export function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const { toggleSidebar } = useSidebar()

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      {/* Left side - Mobile menu + Search */}
      <div className="flex flex-1 items-center space-x-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="lg:hidden p-2"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open sidebar</span>
        </Button>

        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students, employers, jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="relative text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs bg-primary text-primary-foreground">
            3
          </Badge>
        </Button>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  )
}
