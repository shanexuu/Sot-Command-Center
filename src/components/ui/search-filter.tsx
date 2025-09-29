'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Filter, X } from 'lucide-react'

interface SearchFilterProps {
  onSearch: (query: string) => void
  onFilter: (filters: Record<string, string>) => void
  searchPlaceholder?: string
  filters?: Array<{
    key: string
    label: string
    options: Array<{ value: string; label: string }>
  }>
  className?: string
}

export function SearchFilter({
  onSearch,
  onFilter,
  searchPlaceholder = 'Search...',
  filters = [],
  className = '',
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = () => {
    onSearch(searchQuery)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value }
    setActiveFilters(newFilters)
    onFilter(newFilters)
  }

  const clearFilters = () => {
    setActiveFilters({})
    onFilter({})
  }

  const hasActiveFilters = Object.values(activeFilters).some(
    (value) => value !== ''
  )

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          {/* Search Bar */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleSearch}
              size="sm"
            >
              Search
            </Button>
            {filters.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 h-2 w-2 bg-blue-500 dark:bg-blue-400 rounded-full"></span>
                )}
              </Button>
            )}
          </div>

          {/* Filters */}
          {showFilters && filters.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Filters</h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filters.map((filter) => (
                  <div
                    key={filter.key}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium text-muted-foreground">
                      {filter.label}
                    </label>
                    <Select
                      value={activeFilters[filter.key] || ''}
                      onValueChange={(value) =>
                        handleFilterChange(filter.key, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={`Select ${filter.label.toLowerCase()}`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All</SelectItem>
                        {filter.options.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
