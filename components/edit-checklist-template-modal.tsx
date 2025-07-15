"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { updateChecklistTemplate } from "@/app/checklists/actions"
import { toast } from "sonner"

interface ChecklistTemplate {
  id: string
  name: string
  type: string
  description: string | null
  isActive: boolean
}

interface EditChecklistTemplateModalProps {
  isOpen?: boolean
  onClose?: () => void
  template: ChecklistTemplate
  children?: React.ReactNode
}

export function EditChecklistTemplateModal({ isOpen, onClose, template }: EditChecklistTemplateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    formData.append('id', template.id)
    
    const result = await updateChecklistTemplate(formData)

    if (result?.error) {
      toast.error('Error: ' + result.error)
    } else {
      toast.success('Checklist template updated successfully')
      onClose?.()
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Checklist Template</DialogTitle>
          <DialogDescription>
            Update the checklist template details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={template.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select name="type" defaultValue={template.type} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="offboarding">Offboarding</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={template.description || ""}
              placeholder="Brief description of this checklist template"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isActive" 
              name="isActive" 
              defaultChecked={template.isActive}
            />
            <Label htmlFor="isActive">Active Template</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
