import { useState, useEffect, useCallback } from "react"
import { getStaff } from "@/app/staff/actions"
import { toast } from "sonner"

interface StaffMember {
  id: string
  email: string
  firstname: string
  lastname: string
  department: string | null
}

interface UseStaffSelectionOptions {
  excludeStaffId?: string | null
  onModalOpen?: boolean
}

export function useStaffSelection({ excludeStaffId, onModalOpen }: UseStaffSelectionOptions = {}) {
  const [selectedStaffId, setSelectedStaffId] = useState("")
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load staff members and sort by surname
  const loadStaffMembers = useCallback(async () => {
    setIsLoading(true)
    try {
      const staff = await getStaff()
      // Filter out excluded staff if any and sort by lastname
      const availableStaff = staff
        .filter(s => s.id !== excludeStaffId)
        .sort((a, b) => a.lastname.localeCompare(b.lastname))
      setStaffMembers(availableStaff)
    } catch (error) {
      console.error('Failed to load staff:', error)
      toast.error("Failed to load staff members")
    } finally {
      setIsLoading(false)
    }
  }, [excludeStaffId])

  useEffect(() => {
    if (onModalOpen) {
      loadStaffMembers()
    }
  }, [onModalOpen, loadStaffMembers])

  const resetSelection = () => {
    setSelectedStaffId("")
  }

  const getSelectedStaff = () => {
    return staffMembers.find(s => s.id === selectedStaffId)
  }

  return {
    selectedStaffId,
    setSelectedStaffId,
    staffMembers,
    isLoading,
    loadStaffMembers,
    resetSelection,
    getSelectedStaff
  }
}

export type { StaffMember }
