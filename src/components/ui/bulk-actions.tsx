'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { CheckSquare, Square, Trash2, CheckCircle, XCircle } from 'lucide-react'

interface BulkActionsProps {
  selectedItems: string[]
  onSelectAll: () => void
  onSelectNone: () => void
  onBulkAction: (action: string, itemIds: string[]) => void
  totalItems: number
  actions?: Array<{
    value: string
    label: string
    icon?: React.ReactNode
    variant?:
      | 'default'
      | 'destructive'
      | 'outline'
      | 'secondary'
      | 'ghost'
      | 'link'
  }>
  className?: string
}

const DEFAULT_ACTIONS = [
  {
    value: 'approve',
    label: 'Approve Selected',
    icon: <CheckCircle className="h-4 w-4" />,
    variant: 'default' as const,
  },
  {
    value: 'reject',
    label: 'Reject Selected',
    icon: <XCircle className="h-4 w-4" />,
    variant: 'destructive' as const,
  },
  {
    value: 'delete',
    label: 'Delete Selected',
    icon: <Trash2 className="h-4 w-4" />,
    variant: 'destructive' as const,
  },
]

export function BulkActions({
  selectedItems,
  onSelectAll,
  onSelectNone,
  onBulkAction,
  totalItems,
  actions = DEFAULT_ACTIONS,
  className = '',
}: BulkActionsProps) {
  const [selectedAction, setSelectedAction] = useState('')
  const allSelected = selectedItems.length === totalItems && totalItems > 0
  const someSelected =
    selectedItems.length > 0 && selectedItems.length < totalItems

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectNone()
    } else {
      onSelectAll()
    }
  }

  const handleBulkAction = () => {
    if (selectedAction && selectedItems.length > 0) {
      onBulkAction(selectedAction, selectedItems)
      setSelectedAction('')
    }
  }

  if (selectedItems.length === 0 && !someSelected) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center space-x-2"
              >
                {allSelected ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <span>Select All ({totalItems})</span>
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              No items selected
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center space-x-2"
            >
              {allSelected ? (
                <CheckSquare className="h-4 w-4" />
              ) : someSelected ? (
                <div className="h-4 w-4 border-2 border-current rounded-sm" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              <span>
                {allSelected ? 'Deselect All' : 'Select All'} ({totalItems})
              </span>
            </Button>

            <div className="text-sm text-muted-foreground">
              {selectedItems.length} selected
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Select
              value={selectedAction}
              onValueChange={setSelectedAction}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Choose action..." />
              </SelectTrigger>
              <SelectContent>
                {actions.map((action) => (
                  <SelectItem
                    key={action.value}
                    value={action.value}
                  >
                    <div className="flex items-center space-x-2">
                      {action.icon}
                      <span>{action.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleBulkAction}
              disabled={!selectedAction || selectedItems.length === 0}
              variant={
                actions.find((a) => a.value === selectedAction)?.variant ||
                'default'
              }
              size="sm"
            >
              Apply
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
