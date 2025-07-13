// app/laptops/columns.tsx
"use client" // This file needs to be a Client Component for interactivity

import { ColumnDef } from "@tanstack/react-table"
import { Laptop } from "@prisma/client" // Import your Laptop type
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

export const columns: ColumnDef<Laptop>[] = [
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
  },
  {
    accessorKey: "model",
    header: "Model",
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
      const assignedTo = row.getValue("assignedTo")
      return assignedTo || 'Unassigned' // Display 'Unassigned' if null
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const laptop = row.original

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
                navigator.clipboard.writeText(laptop.serialNumber);
                // You could add a toast notification here as well!
              }}
            >
              Copy Serial Number
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit Laptop</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete Laptop</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]