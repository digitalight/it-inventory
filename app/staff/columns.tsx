// app/staff/columns.tsx
"use client" // This file needs to be a Client Component for interactivity

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"
import { toast } from "sonner"
import EditStaffForm from "./edit-staff-form"
import { deleteStaff } from "./actions"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { AssignLaptopModal } from "@/components/assign-laptop-modal"

// Actions cell component
function ActionsCell({ staff }: { staff: StaffWithLaptops }) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [assignLaptopModalOpen, setAssignLaptopModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteStaff(staff.id)
    
    if (result?.error) {
      toast.error('Error: ' + result.error)
    } else {
      toast.success('Staff member deleted successfully')
      setDeleteModalOpen(false)
    }
    setIsDeleting(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(`${staff.firstname} ${staff.lastname}`)
              toast.success('Name copied to clipboard')
            }}
          >
            Copy Name
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setAssignLaptopModalOpen(true)}>
            Assign Laptop
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
            Edit Staff
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete Staff
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Assign Laptop Modal */}
      <AssignLaptopModal
        isOpen={assignLaptopModalOpen}
        onClose={() => setAssignLaptopModalOpen(false)}
        staffId={staff.id}
        staffName={`${staff.firstname} ${staff.lastname}`}
      />

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update the staff member details below.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <EditStaffForm 
              staff={staff} 
              onSuccess={() => setEditModalOpen(false)} 
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Staff Member"
        description={`Are you sure you want to delete this staff member? ${staff.laptops && staff.laptops.length > 0 ? 'This staff member has assigned laptops and cannot be deleted.' : 'This will remove them from the system.'}`}
        itemName={`${staff.firstname} ${staff.lastname} (${staff.email})`}
        isDeleting={isDeleting}
      />
    </>
  )
}

// Define the type for staff with laptops relationship
type StaffWithLaptops = {
  id: string
  email: string
  firstname: string
  lastname: string
  department: string | null
  isteacher: boolean
  laptops: Array<{ id: string; serialNumber: string }>
  createdAt: Date
  updatedAt: Date
  startDate: Date
  leavingDate: Date | null
}

export const columns: ColumnDef<StaffWithLaptops>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
    },
  },
  {
    accessorKey: "firstname",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            First Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
    },
  },
  {
    accessorKey: "lastname",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
    },
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => {
      const department = row.getValue("department")
      return department || 'Not specified'
    }
  },
  {
    accessorKey: "isteacher",
    header: "Role",
    cell: ({ row }) => {
      const isTeacher = row.getValue("isteacher") as boolean
      return (
        <span className={isTeacher ? 'text-blue-600 font-medium' : 'text-gray-600'}>
          {isTeacher ? 'Teacher' : 'Associate'}
        </span>
      )
    },
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const startDate = row.getValue("startDate") as Date
      return new Date(startDate).toLocaleDateString()
    },
  },
  {
    accessorKey: "leavingDate",
    header: "Leaving Date",
    cell: ({ row }) => {
      const leavingDate = row.getValue("leavingDate") as Date | null
      if (!leavingDate) return 'Active'
      
      const isPast = new Date(leavingDate) < new Date()
      return (
        <span className={isPast ? 'text-red-500 font-medium' : 'text-orange-500 font-medium'}>
          {new Date(leavingDate).toLocaleDateString()}
        </span>
      )
    },
  },
  {
    id: "laptopCount",
    header: "Laptops Assigned",
    cell: ({ row }) => {
      const laptops = row.original.laptops || []
      const count = laptops.length
      return (
        <div className="flex items-center">
          <span className={`font-medium ${count > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
            {count}
          </span>
          {count > 0 && (
            <span className="ml-1 text-xs text-gray-500">
              laptop{count !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return <ActionsCell staff={row.original} />
    },
  },
]
