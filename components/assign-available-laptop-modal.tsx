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
import { assignLaptopToStaff } from "@/app/laptops/actions"
import { toast } from "sonner"
import { UserPlus } from "lucide-react"

interface AssignAvailableLaptopModalProps {
  isOpen: boolean
  onClose: () => void
  laptopId: string
  laptopName: string
}

export function AssignAvailableLaptopModal({ 
  isOpen, 
  onClose, 
  laptopId, 
  laptopName 
}: AssignAvailableLaptopModalProps) {
  const [isAssigning, setIsAssigning] = useState(false)
  
  const {
    selectedStaffId,
    setSelectedStaffId,
    staffMembers,
    isLoading,
    resetSelection,
    getSelectedStaff
  } = useStaffSelection({ 
    onModalOpen: isOpen 
  })

  const handleAssign = async () => {
    if (!selectedStaffId) {
      toast.error("Please select a staff member")
      return
    }

    setIsAssigning(true)
    try {
      const result = await assignLaptopToStaff(laptopId, selectedStaffId)
      
      if (result?.error) {
        toast.error('Error: ' + result.error)
      } else {
        const selectedStaff = getSelectedStaff()
        toast.success(`Laptop assigned to ${selectedStaff?.firstname} ${selectedStaff?.lastname} successfully`)
        onClose()
        resetSelection()
      }
    } catch (error) {
      console.error('Failed to assign laptop:', error)
      toast.error("Failed to assign laptop")
    } finally {
      setIsAssigning(false)
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
            <UserPlus className="h-5 w-5" />
            Assign {laptopName}
          </DialogTitle>
          <DialogDescription>
            Select a staff member to assign this available laptop to. The laptop status will be changed to &quot;Assigned&quot;.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <StaffSelector
            selectedStaffId={selectedStaffId}
            onStaffChange={setSelectedStaffId}
            staffMembers={staffMembers}
            isLoading={isLoading}
            noStaffMessage="No staff members available for assignment."
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose} disabled={isAssigning}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedStaffId || isAssigning || staffMembers.length === 0}
          >
            {isAssigning ? 'Assigning...' : 'Assign Laptop'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
