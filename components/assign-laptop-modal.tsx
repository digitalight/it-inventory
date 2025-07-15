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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { assignLaptopToStaff, getAvailableLaptops } from "@/app/laptops/actions"
import { toast } from "sonner"
import { useEffect } from "react"
import { Laptop } from "lucide-react"

interface AvailableLaptop {
  id: string
  make: string
  model: string
  deviceName: string | null
  serialNumber: string
}

interface AssignLaptopModalProps {
  isOpen: boolean
  onClose: () => void
  staffId: string
  staffName: string
}

export function AssignLaptopModal({ isOpen, onClose, staffId, staffName }: AssignLaptopModalProps) {
  const [selectedLaptopId, setSelectedLaptopId] = useState("")
  const [availableLaptops, setAvailableLaptops] = useState<AvailableLaptop[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  // Load available laptops when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAvailableLaptops()
    }
  }, [isOpen])

  const loadAvailableLaptops = async () => {
    setIsLoading(true)
    try {
      const laptops = await getAvailableLaptops()
      setAvailableLaptops(laptops)
    } catch (error) {
      console.error('Failed to load laptops:', error)
      toast.error("Failed to load available laptops")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedLaptopId) {
      toast.error("Please select a laptop")
      return
    }

    setIsAssigning(true)
    try {
      const result = await assignLaptopToStaff(selectedLaptopId, staffId)
      
      if (result?.error) {
        toast.error('Error: ' + result.error)
      } else {
        toast.success(`Laptop assigned to ${staffName} successfully`)
        onClose()
        setSelectedLaptopId("")
      }
    } catch (error) {
      console.error('Failed to assign laptop:', error)
      toast.error("Failed to assign laptop")
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Laptop className="h-5 w-5" />
            Assign Laptop to {staffName}
          </DialogTitle>
          <DialogDescription>
            Select an available laptop to assign to this staff member. The laptop status will be updated to &quot;Assigned&quot;.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="laptop">Available Laptops</Label>
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">Loading available laptops...</div>
            ) : availableLaptops.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No available laptops found. All laptops are currently assigned or unavailable.
              </div>
            ) : (
              <Select value={selectedLaptopId} onValueChange={setSelectedLaptopId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a laptop to assign" />
                </SelectTrigger>
                <SelectContent>
                  {availableLaptops.map((laptop) => (
                    <SelectItem key={laptop.id} value={laptop.id}>
                      <div className="flex flex-col">
                        <div className="font-medium">
                          {laptop.make} {laptop.model}
                          {laptop.deviceName && ` (${laptop.deviceName})`}
                        </div>
                        <div className="text-xs text-gray-500">
                          Serial: {laptop.serialNumber}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isAssigning}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedLaptopId || isAssigning || availableLaptops.length === 0}
          >
            {isAssigning ? 'Assigning...' : 'Assign Laptop'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
