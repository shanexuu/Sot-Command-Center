'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { LogOut, User, Settings } from 'lucide-react'

export function UserMenu() {
  const { organizer, signOut, isAdmin, profileTimeout, user } = useAuth()

  // If organizer profile timed out but user is authenticated, show fallback menu
  if (!organizer && !profileTimeout) return null

  const getRoleBadgeVariant = () => {
    if (isAdmin) return 'default'
    return 'secondary'
  }

  const getRoleLabel = () => {
    if (isAdmin) return 'Admin'
    return 'Organizer'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src=""
              alt={organizer?.first_name || user?.email || 'User'}
            />
            <AvatarFallback>
              {organizer
                ? `${organizer.first_name[0]}${organizer.last_name[0]}`
                : user?.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {organizer
                ? `${organizer.first_name} ${organizer.last_name}`
                : user?.email || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {organizer?.email || user?.email || 'Loading...'}
            </p>
            <div className="pt-1">
              <Badge
                variant={getRoleBadgeVariant()}
                className="text-xs"
              >
                {getRoleLabel()}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
