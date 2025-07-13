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
          {isTeacher ? 'Teacher' : 'Staff'}
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
      const staff = row.original

      return (
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
                navigator.clipboard.writeText(`${staff.firstname} ${staff.lastname}`);
              }}
            >
              Copy Name
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit Staff</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete Staff</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
