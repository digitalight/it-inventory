"use client"

import { useState } from "react"
import { Plus, Upload, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AddStaffForm from "@/app/staff/add-staff-form"
import ImportStaffCSVForm from "./import-staff-csv-form"

type ModalType = 'add' | 'import' | null

export function AddStaffModal() {
  const [modalType, setModalType] = useState<ModalType>(null)

  const closeModal = () => setModalType(null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Staff
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setModalType('add')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Single Staff
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setModalType('import')}>
            <Upload className="mr-2 h-4 w-4" />
            Import from CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Staff Modal */}
      <Dialog open={modalType === 'add'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Enter the details for the new staff member below.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <AddStaffForm onSuccess={closeModal} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Import CSV Modal */}
      <Dialog open={modalType === 'import'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import Staff from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import multiple staff members. Existing staff will be updated.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <ImportStaffCSVForm onSuccess={closeModal} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
