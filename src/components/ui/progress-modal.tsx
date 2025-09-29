'use client'

import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'
import { Progress } from './progress'
import { Badge } from './badge'
import { CheckCircle, XCircle, Loader2, Bot, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalysisResult {
  id: string
  name: string
  score: number
  success: boolean
  analysisType: string
  error?: string
}

interface ProgressModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  totalItems: number
  completedItems: number
  results: AnalysisResult[]
  isComplete: boolean
  successCount: number
  failedCount: number
}

export function ProgressModal({
  isOpen,
  onClose,
  title,
  description,
  totalItems,
  completedItems,
  results,
  isComplete,
  successCount,
  failedCount,
}: ProgressModalProps) {
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  const getAnalysisTypeIcon = (type: string) => {
    switch (type) {
      case 'openai':
        return <Sparkles className="h-4 w-4 text-purple-600" />
      case 'rule_based_fallback':
        return <Bot className="h-4 w-4 text-blue-600" />
      case 'ai_analysis':
        return <Bot className="h-4 w-4 text-green-600" />
      case 'Individual Analysis':
        return <Sparkles className="h-4 w-4 text-purple-600" />
      case 'Individual Enhancement':
        return <Bot className="h-4 w-4 text-purple-600" />
      case 'Job Enhancement':
        return <Bot className="h-4 w-4 text-blue-600" />
      case 'Bulk Approval':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'Profile Approval':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'CV Analysis':
        return <Sparkles className="h-4 w-4 text-green-600" />
      case 'ACADEMIC_RECORDS Analysis':
        return <Sparkles className="h-4 w-4 text-purple-600" />
      case 'Email Notification':
        return <Bot className="h-4 w-4 text-blue-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Bot className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case 'openai':
        return 'OpenAI GPT-4'
      case 'rule_based_fallback':
        return 'Rule-based'
      case 'ai_analysis':
        return 'AI Analysis'
      case 'Individual Analysis':
        return 'OpenAI GPT-4'
      case 'Individual Enhancement':
        return 'AI Job Enhancement (GPT-4)'
      case 'Job Enhancement':
        return 'AI Job Enhancement (GPT-4)'
      case 'Bulk Approval':
        return 'Profile Approval'
      case 'Profile Approval':
        return 'Profile Approval'
      case 'CV Analysis':
        return 'CV Analysis (GPT-4)'
      case 'ACADEMIC_RECORDS Analysis':
        return 'Academic Records (GPT-4)'
      case 'Email Notification':
        return 'Email Notification'
      case 'failed':
        return 'Failed'
      default:
        return 'Unknown'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-[700px] border shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center space-x-3 text-xl font-semibold">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg">
              <Bot className="h-5 w-5" />
            </div>
            <span className="text-foreground font-bold">{title}</span>
          </DialogTitle>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </DialogHeader>

        <div className="space-y-8">
          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                Progress
              </span>
              <span className="text-sm font-semibold bg-muted text-muted-foreground px-3 py-1 rounded-full">
                {completedItems} of {totalItems} completed
              </span>
            </div>
            <div className="relative">
              <Progress
                value={progress}
                className="h-3 bg-muted/30 rounded-full overflow-hidden"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">
                {Math.round(progress)}% complete
              </span>
              {!isComplete && (
                <span className="flex items-center space-x-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                  <span className="text-sm font-medium">Processing...</span>
                </span>
              )}
            </div>
          </div>

          {/* Results Section */}
          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-foreground">
                  Analysis Results
                </h4>
                <div className="flex space-x-2">
                  {successCount > 0 && (
                    <Badge
                      variant="outline"
                      className="text-emerald-700 border-emerald-300 bg-emerald-100 px-3 py-1 font-semibold"
                    >
                      <CheckCircle className="h-3 w-3 mr-1.5" />
                      {successCount} successful
                    </Badge>
                  )}
                  {failedCount > 0 && (
                    <Badge
                      variant="outline"
                      className="text-red-700 border-red-300 bg-red-100 px-3 py-1 font-semibold"
                    >
                      <XCircle className="h-3 w-3 mr-1.5" />
                      {failedCount} failed
                    </Badge>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-3">
                {results.map((result, index) => (
                  <div
                    key={`${result.id}-${index}`}
                    className="group flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:shadow-md"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={cn(
                          'flex items-center justify-center w-10 h-10 rounded-full',
                          result.success
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-red-100 text-red-600'
                        )}
                      >
                        {result.success ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-foreground">
                          {result.name}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          {getAnalysisTypeIcon(result.analysisType)}
                          <span className="font-semibold">
                            {getAnalysisTypeLabel(result.analysisType)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {result.success ? (
                        <div
                          className={cn(
                            'text-lg font-bold px-3 py-1 rounded-full bg-muted',
                            getScoreColor(result.score)
                          )}
                        >
                          {Math.round(result.score * 10) / 10}/10
                        </div>
                      ) : (
                        <div className="text-sm text-red-700 font-bold px-3 py-1 rounded-full bg-red-100">
                          Failed
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Section */}
          {isComplete && (
            <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-100 p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-200 text-emerald-800">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold text-emerald-900">
                  Analysis Complete!
                </span>
              </div>
              <div className="text-sm text-emerald-800 leading-relaxed font-medium">
                Successfully processed{' '}
                <span className="font-bold">{successCount}</span> items.
                {failedCount > 0 && ` ${failedCount} items failed to process.`}
                {successCount > 0 &&
                  ' Check the results to see the updated AI scores and recommendations.'}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
