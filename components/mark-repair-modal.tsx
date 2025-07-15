'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { markLaptopForRepair } from '@/app/laptops/actions'

interface MarkRepairModalProps {
  isOpen: boolean
  onClose: () => void
  laptopId: string
  laptopName: string
}

export function MarkRepairModal({
  isOpen,
  onClose,
  laptopId,
  laptopName,
}: MarkRepairModalProps) {
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!notes.trim()) {
      toast.error('Please provide repair notes')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('laptopId', laptopId)
      formData.append('notes', notes.trim())

      const result = await markLaptopForRepair(formData)

      if (result?.error) {
        toast.error('Error: ' + result.error)
      } else {
        toast.success('Laptop marked for repair successfully')
        setNotes('')
        onClose()
      }
    } catch (error) {
      console.error('Error marking laptop for repair:', error)
      toast.error('Failed to mark laptop for repair')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setNotes('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark Laptop for Repair</DialogTitle>
          <DialogDescription>
            Mark {laptopName} as needing repair. The laptop status will be changed to &quot;In Repair&quot;.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notes">Repair Notes *</Label>
              <Textarea
                id="notes"
                placeholder="Describe the issue or reason for repair..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
                rows={4}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !notes.trim()}
            >
              {isSubmitting ? 'Marking for Repair...' : 'Mark for Repair'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
