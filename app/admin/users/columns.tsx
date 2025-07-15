"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Shield, User, Eye, EyeOff, RotateCcw, Trash2 } from "lucide-react"
import { toast } from "sonner"

export type UserData = {
  id: string
  username: string
  email: string | null
  role: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

async function toggleUserStatus(userId: string, currentStatus: boolean) {
  try {
    const response = await fetch('/api/admin/users/toggle-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })

    if (response.ok) {
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`)
      window.location.reload()
    } else {
      toast.error('Failed to update user status')
    }
  } catch (error) {
    console.error('Error:', error)
    toast.error('An error occurred')
  }
}

async function resetPassword(userId: string, username: string) {
  const newPassword = prompt(`Enter new password for ${username}:`)
  if (!newPassword) return

  try {
    const response = await fetch('/api/admin/users/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, newPassword }),
    })

    if (response.ok) {
      toast.success('Password reset successfully')
    } else {
      toast.error('Failed to reset password')
    }
  } catch (error) {
    console.error('Error:', error)
    toast.error('An error occurred')
  }
}

async function deleteUser(userId: string, username: string) {
  const confirmDelete = confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)
  if (!confirmDelete) return

  try {
    const response = await fetch('/api/admin/users/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })

    if (response.ok) {
      toast.success('User deleted successfully')
      window.location.reload()
    } else {
      const errorData = await response.json()
      toast.error(errorData.error || 'Failed to delete user')
    }
  } catch (error) {
    console.error('Error:', error)
    toast.error('An error occurred')
  }
}

export const userColumns: ColumnDef<UserData>[] = [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{user.username}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string | null
      return email ? (
        <span className="text-sm text-muted-foreground">{email}</span>
      ) : (
        <span className="text-sm text-muted-foreground italic">No email</span>
      )
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      return (
        <Badge variant={role === "admin" ? "destructive" : "secondary"}>
          {role === "admin" ? (
            <>
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </>
          ) : (
            <>
              <User className="h-3 w-3 mr-1" />
              User
            </>
          )}
        </Badge>
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
          {isActive ? (
            <>
              <Eye className="h-3 w-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <EyeOff className="h-3 w-3 mr-1" />
              Inactive
            </>
          )}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date
      return (
        <span className="text-sm text-muted-foreground">
          {new Date(date).toLocaleDateString()}
        </span>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => toggleUserStatus(user.id, user.isActive)}
            >
              {user.isActive ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => resetPassword(user.id, user.username)}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteUser(user.id, user.username)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
