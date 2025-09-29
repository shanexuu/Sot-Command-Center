'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertTriangle, X } from 'lucide-react'

interface RejectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reasons: string[]) => void
  studentName: string
  isLoading?: boolean
}

const commonRejectionReasons = [
  'Incomplete profile information',
  'Missing or unclear CV/resume',
  'Academic records not provided or unclear',
  'Skills section needs more detail',
  'Contact information incomplete',
  'University/degree information unclear',
  'Graduation year does not match requirements',
  'Location information missing',
  'Bio section too brief or missing',
  'Portfolio/GitHub links not provided',
  'Profile photo missing or inappropriate',
  'LinkedIn profile not provided',
  'Other (please specify)',
]

export function RejectionDialog({
  isOpen,
  onClose,
  onConfirm,
  studentName,
  isLoading = false,
}: RejectionDialogProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [customReason, setCustomReason] = useState('')

  const handleReasonToggle = (reason: string) => {
    if (reason === 'Other (please specify)') {
      // If "Other" is selected, don't add it to the list
      return
    }

    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    )
  }

  const handleConfirm = () => {
    const allReasons = [...selectedReasons]
    if (customReason.trim()) {
      allReasons.push(customReason.trim())
    }

    if (allReasons.length === 0) {
      // If no reasons selected, add a default one
      allReasons.push('Profile requires additional information')
    }

    onConfirm(allReasons)
  }

  const handleClose = () => {
    setSelectedReasons([])
    setCustomReason('')
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleClose}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            Reject Student Profile
          </DialogTitle>
          <DialogDescription>
            Please select the reasons for rejecting{' '}
            <strong>{studentName}</strong>&apos;s profile. This information will
            be included in the rejection email sent to the student.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Rejection Reasons</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Select all applicable reasons for rejection:
            </p>

            <div className="space-y-3 max-h-60 overflow-y-auto border rounded-md p-4">
              {commonRejectionReasons.map((reason) => (
                <div
                  key={reason}
                  className="flex items-start space-x-2"
                >
                  <Checkbox
                    id={reason}
                    checked={selectedReasons.includes(reason)}
                    onCheckedChange={() => handleReasonToggle(reason)}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor={reason}
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    {reason}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-reason">Additional Comments</Label>
            <Textarea
              id="custom-reason"
              placeholder="Add any additional feedback or specific requirements..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Rejecting...
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                Reject Profile
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
