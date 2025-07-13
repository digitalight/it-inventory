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
import AddLaptopForm from "@/app/laptops/add-laptop-form"
import ImportCSVForm from "./import-csv-form"

type ModalType = 'add' | 'import' | null

export function AddLaptopModal() {
  const [modalType, setModalType] = useState<ModalType>(null)

  const closeModal = () => setModalType(null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Laptop
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setModalType('add')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Single Laptop
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setModalType('import')}>
            <Upload className="mr-2 h-4 w-4" />
            Import from CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Laptop Modal */}
      <Dialog open={modalType === 'add'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Laptop</DialogTitle>
            <DialogDescription>
              Enter the details for the new laptop below.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <AddLaptopForm onSuccess={closeModal} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Import CSV Modal */}
      <Dialog open={modalType === 'import'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import Laptops from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import multiple laptops. Existing laptops will be updated.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <ImportCSVForm onSuccess={closeModal} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
