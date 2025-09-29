'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (value: unknown, item: T) => React.ReactNode
  sortable?: boolean
}

interface Action<T> {
  label: string
  icon?: React.ReactNode
  onClick: (item: T) => void
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  actions?: Action<T>[]
  onSelect?: (item: T, selected: boolean) => void
  onSelectAll?: (selected: boolean) => void
  selectedItems?: string[]
  getItemId: (item: T) => string
  title?: string
  emptyMessage?: string
  className?: string
}

export function DataTable<T>({
  data,
  columns,
  actions = [],
  onSelect,
  onSelectAll,
  selectedItems = [],
  getItemId,
  title,
  emptyMessage = 'No data available',
  className = '',
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0

    const aValue = (a as Record<string, unknown>)[sortColumn]
    const bValue = (b as Record<string, unknown>)[sortColumn]

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    // Convert to comparable types
    const aComparable =
      typeof aValue === 'string' ? aValue.toLowerCase() : aValue
    const bComparable =
      typeof bValue === 'string' ? bValue.toLowerCase() : bValue

    // Safe comparison
    if (aComparable < bComparable) return sortDirection === 'asc' ? -1 : 1
    if (aComparable > bComparable) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const allSelected = selectedItems.length === data.length && data.length > 0
  const someSelected =
    selectedItems.length > 0 && selectedItems.length < data.length

  const handleSelectAll = () => {
    onSelectAll?.(!allSelected)
  }

  const handleSelectItem = (item: T, selected: boolean) => {
    onSelect?.(item, selected)
  }

  const renderCellValue = (column: Column<T>, item: T): React.ReactNode => {
    const value =
      typeof column.key === 'string'
        ? (item as Record<string, unknown>)[column.key]
        : item[column.key]

    if (column.render) {
      return column.render(value, item)
    }

    // Convert value to string for display
    if (value === null || value === undefined) {
      return ''
    }

    if (typeof value === 'string' || typeof value === 'number') {
      return String(value)
    }

    if (Array.isArray(value)) {
      return value.join(', ')
    }

    if (typeof value === 'object') {
      return JSON.stringify(value)
    }

    return String(value)
  }

  if (data.length === 0) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {onSelect && (
                  <th className="text-left p-4">
                    <Checkbox
                      checked={allSelected}
                      ref={(el) => {
                        if (el) {
                          const input = el.querySelector(
                            'input[type="checkbox"]'
                          ) as HTMLInputElement
                          if (input) input.indeterminate = someSelected
                        }
                      }}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`text-left p-4 ${
                      column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''
                    }`}
                    onClick={() =>
                      column.sortable && handleSort(String(column.key))
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{column.label}</span>
                      {column.sortable && sortColumn === String(column.key) && (
                        <span className="text-xs">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="text-right p-4">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item) => {
                const itemId = getItemId(item)
                const isSelected = selectedItems.includes(itemId)

                return (
                  <tr
                    key={itemId}
                    className="border-b hover:bg-muted/50"
                  >
                    {onSelect && (
                      <td className="p-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleSelectItem(item, !!checked)
                          }
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className="p-4"
                      >
                        {renderCellValue(column, item)}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="p-4">
                        <div className="flex justify-end space-x-2">
                          {actions.length <= 2 ? (
                            actions.map((action, actionIndex) => (
                              <Button
                                key={actionIndex}
                                variant={action.variant || 'outline'}
                                size="sm"
                                onClick={() => action.onClick(item)}
                              >
                                {action.icon}
                                <span className="ml-1">{action.label}</span>
                              </Button>
                            ))
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {actions.map((action, actionIndex) => (
                                  <DropdownMenuItem
                                    key={actionIndex}
                                    onClick={() => action.onClick(item)}
                                    className={
                                      action.variant === 'destructive'
                                        ? 'text-destructive'
                                        : ''
                                    }
                                  >
                                    {action.icon}
                                    <span className="ml-2">{action.label}</span>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
