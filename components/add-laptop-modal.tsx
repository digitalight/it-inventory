"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import AddLaptopForm from "@/app/laptops/add-laptop-form"

export function AddLaptopModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Laptop
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Laptop</DialogTitle>
          <DialogDescription>
            Enter the details for the new laptop below.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <AddLaptopForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
