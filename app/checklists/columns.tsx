"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ArrowUpDown, Users, Clock } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { deleteChecklistTemplate } from "./actions"
import { EditChecklistTemplateModal } from "@/components/edit-checklist-template-modal"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import Link from "next/link"

type ChecklistTemplate = {
  id: string
  name: string
  type: string
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  items: Array<{
    id: string
    title: string
    description: string | null
    order: number
    category: string | null
    isRequired: boolean
    estimatedTime: number | null
  }>
  _count: {
    instances: number
  }
}

function ActionsCell({ template }: { template: ChecklistTemplate }) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteChecklistTemplate(template.id)
    
    if (result?.error) {
      toast.error('Error: ' + result.error)
    } else {
      toast.success('Checklist template deleted successfully')
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
            <Link href={`/checklists/${template.id}`}>
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
            Edit Template
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete Template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditChecklistTemplateModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        template={template}
      />

      <ConfirmDeleteDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Checklist Template"
        description={`Are you sure you want to delete this checklist template? ${template._count.instances > 0 ? 'This template has existing instances and cannot be deleted.' : 'This will permanently remove the template and all its items.'}`}
        itemName={template.name}
        isDeleting={isDeleting}
      />
    </>
  )
}

export const columns: ColumnDef<ChecklistTemplate>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Template Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const template = row.original
      return (
        <div>
          <div className="font-medium">{template.name}</div>
          {template.description && (
            <div className="text-sm text-muted-foreground">
              {template.description}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <Badge variant={type === "onboarding" ? "default" : "secondary"}>
          {type === "onboarding" ? "Onboarding" : "Offboarding"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => {
      const items = row.getValue("items") as ChecklistTemplate["items"]
      const requiredItems = items.filter(item => item.isRequired).length
      const totalTime = items.reduce((sum, item) => sum + (item.estimatedTime || 0), 0)
      
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {items.length} items ({requiredItems} required)
          </div>
          {totalTime > 0 && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ~{Math.round(totalTime / 60)}h {totalTime % 60}m
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "_count.instances",
    header: "Usage",
    cell: ({ row }) => {
      const count = row.getValue("_count.instances") as number
      return (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{count} instances</span>
        </div>
      )
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean
      return (
        <Badge variant={isActive ? "default" : "outline"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell template={row.original} />,
  },
]
