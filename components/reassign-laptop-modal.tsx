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
import { StaffSelector } from "@/components/staff-selector"
import { useStaffSelection } from "@/hooks/use-staff-selection"
import { reassignLaptop } from "@/app/laptops/actions"
import { toast } from "sonner"
import { RefreshCw } from "lucide-react"

interface ReassignLaptopModalProps {
  isOpen: boolean
  onClose: () => void
  laptopId: string
  laptopName: string
  currentStaffId?: string | null
}

export function ReassignLaptopModal({ 
  isOpen, 
  onClose, 
  laptopId, 
  laptopName, 
  currentStaffId 
}: ReassignLaptopModalProps) {
  const [isReassigning, setIsReassigning] = useState(false)
  
  const {
    selectedStaffId,
    setSelectedStaffId,
    staffMembers,
    isLoading,
    resetSelection,
    getSelectedStaff
  } = useStaffSelection({ 
    excludeStaffId: currentStaffId, 
    onModalOpen: isOpen 
  })

  const handleReassign = async () => {
    if (!selectedStaffId) {
      toast.error("Please select a staff member")
      return
    }

    setIsReassigning(true)
    try {
      const result = await reassignLaptop(laptopId, selectedStaffId)
      
      if (result?.error) {
        toast.error('Error: ' + result.error)
      } else {
        const selectedStaff = getSelectedStaff()
        toast.success(`Laptop reassigned to ${selectedStaff?.firstname} ${selectedStaff?.lastname} successfully`)
        onClose()
        resetSelection()
      }
    } catch (error) {
      console.error('Failed to reassign laptop:', error)
      toast.error("Failed to reassign laptop")
    } finally {
      setIsReassigning(false)
    }
  }

  const handleClose = () => {
    resetSelection()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Reassign {laptopName}
          </DialogTitle>
          <DialogDescription>
            Select a staff member to reassign this laptop to. The laptop will remain in its current status but be assigned to the new staff member.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <StaffSelector
            selectedStaffId={selectedStaffId}
            onStaffChange={setSelectedStaffId}
            staffMembers={staffMembers}
            isLoading={isLoading}
            noStaffMessage="No other staff members available for assignment."
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose} disabled={isReassigning}>
            Cancel
          </Button>
          <Button 
            onClick={handleReassign} 
            disabled={!selectedStaffId || isReassigning || staffMembers.length === 0}
          >
            {isReassigning ? 'Reassigning...' : 'Reassign Laptop'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
