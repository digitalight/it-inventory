// app/laptops/columns.tsx
"use client" // This file needs to be a Client Component for interactivity

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, History } from "lucide-react"
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
import EditLaptopForm from "./edit-laptop-form"
import { deleteLaptop } from "./actions"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { LaptopHistoryModal } from "@/components/laptop-history-modal"
import { WipeLaptopModal } from "@/components/wipe-laptop-modal"
import { CompleteRepairModal } from "@/components/complete-repair-modal"
import Link from "next/link"

// Actions cell component
function ActionsCell({ laptop }: { laptop: LaptopWithStaff }) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [wipeModalOpen, setWipeModalOpen] = useState(false)
  const [repairModalOpen, setRepairModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteLaptop(laptop.id)
    
    if (result?.error) {
      toast.error('Error: ' + result.error)
    } else {
      toast.success('Laptop deleted successfully')
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
          <DropdownMenuItem asChild>
            <Link href={`/laptops/${laptop.id}`}>
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(laptop.serialNumber);
              toast.success('Serial number copied to clipboard')
            }}
          >
            Copy Serial Number
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
            Edit Laptop
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setHistoryModalOpen(true)}>
            View History
          </DropdownMenuItem>
          {laptop.status === 'In Repair' && (
            <DropdownMenuItem 
              onClick={() => setRepairModalOpen(true)}
              className="text-green-600"
            >
              Complete Repair
            </DropdownMenuItem>
          )}
          {laptop.status === 'Returned' && (
            <DropdownMenuItem 
              onClick={() => setWipeModalOpen(true)}
              className="text-blue-600"
            >
              Wiped
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete Laptop
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Laptop</DialogTitle>
            <DialogDescription>
              Update the laptop details below.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <EditLaptopForm 
              laptop={laptop} 
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
        title="Delete Laptop"
        description="Are you sure you want to delete this laptop? This will remove it from the inventory system."
        itemName={laptop.deviceName || `${laptop.make} ${laptop.model} (${laptop.serialNumber})`}
        isDeleting={isDeleting}
      />

      {/* History Modal */}
      <LaptopHistoryModal
        laptopId={laptop.id}
        laptopName={laptop.deviceName || `${laptop.make} ${laptop.model}`}
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
      />

      {/* Wipe Confirmation Modal */}
      <WipeLaptopModal
        isOpen={wipeModalOpen}
        onClose={() => setWipeModalOpen(false)}
        laptopId={laptop.id}
        laptopName={laptop.deviceName || `${laptop.make} ${laptop.model}`}
      />

      {/* Complete Repair Modal */}
      <CompleteRepairModal
        isOpen={repairModalOpen}
        onClose={() => setRepairModalOpen(false)}
        laptopId={laptop.id}
        laptopName={laptop.deviceName || `${laptop.make} ${laptop.model}`}
        hasAssignment={!!laptop.assignedToId}
      />
    </>
  )
}

// Define the type for laptop with staff relationship
type LaptopWithStaff = {
  id: string
  make: string
  model: string
  deviceName: string | null
  serialNumber: string
  status: string
  assignedToId: string | null
  assignedTo: {
    id: string
    email: string
    firstname: string
    lastname: string
  } | null
  createdAt: Date
  updatedAt: Date
  returnDate: Date | null
}

export const columns: ColumnDef<LaptopWithStaff>[] = [
  {
    accessorKey: "deviceName",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Device Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
    },
    cell: ({ row }) => {
      const laptop = row.original;
      const deviceName = laptop.deviceName || "-";
      return (
        <Link 
          href={`/laptops/${laptop.id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {deviceName}
        </Link>
      );
    },
  },
  {
    accessorKey: "make",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Make
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
    },
    cell: ({ row }) => {
      const laptop = row.original;
      return (
        <Link 
          href={`/laptops/${laptop.id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {laptop.make}
        </Link>
      );
    },
  },
  {
    accessorKey: "model",
    header: "Model",
    cell: ({ row }) => {
      const laptop = row.original;
      return (
        <Link 
          href={`/laptops/${laptop.id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {laptop.model}
        </Link>
      );
    },
  },
  {
    accessorKey: "serialNumber",
    header: "Serial Number",
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      let statusColorClass = '';
      switch (status) {
        case 'Available':
          statusColorClass = 'text-green-500 font-medium';
          break;
        case 'Assigned':
          statusColorClass = 'text-blue-500 font-medium';
          break;
        case 'In Repair':
          statusColorClass = 'text-yellow-600 font-medium'; // Darker yellow for visibility
          break;
        case 'Retired':
          statusColorClass = 'text-red-500 font-medium';
          break;
        case 'Returned':
          statusColorClass = 'text-orange-500 font-medium';
          break;
        default:
          statusColorClass = '';
      }
      return <span className={statusColorClass}>{status}</span>;
    },
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned To",
    cell: ({ row }) => {
      const assignedTo = row.original.assignedTo
      if (!assignedTo) return 'Unassigned'
      
      return (
        <div className="flex flex-col">
          <span className="font-medium">{`${assignedTo.firstname} ${assignedTo.lastname}`}</span>
          <span className="text-xs text-gray-500">{assignedTo.email}</span>
        </div>
      )
    }
  },
  {
    id: "history",
    header: "History",
    enableHiding: false,
    cell: ({ row }) => {
      const laptop = row.original;
      return (
        <LaptopHistoryModal
          laptopId={laptop.id}
          laptopName={`${laptop.make} ${laptop.model}`}
          triggerButton={
            <Button variant="ghost" size="sm">
              <History className="h-4 w-4" />
            </Button>
          }
        />
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return <ActionsCell laptop={row.original} />
    },
  },
]