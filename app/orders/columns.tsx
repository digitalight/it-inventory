// app/orders/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, FileText, Package, Clock, CheckCircle, Trash2 } from "lucide-react"
import { updateOrderStatus, deleteOrder } from "./actions"
import { toast } from "sonner"
import Link from "next/link"

export type Order = {
  id: string
  name: string
  supplier: {
    name: string
    contactName?: string | null
    email?: string | null
  }
  status: string
  requestedBy: string
  deliveryCost: number
  totalAmount: number
  createdAt: Date
  deliveredAt?: Date | null
  _count: {
    items: number
    documents: number
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Request':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
    case 'Quotes':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
    case 'Ordered':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
    case 'Delivered':
      return 'bg-green-100 text-green-800 hover:bg-green-200'
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Request':
      return <Clock className="h-3 w-3" />
    case 'Quotes':
      return <FileText className="h-3 w-3" />
    case 'Ordered':
      return <Package className="h-3 w-3" />
    case 'Delivered':
      return <CheckCircle className="h-3 w-3" />
    default:
      return null
  }
}

const handleStatusUpdate = async (orderId: string, newStatus: string) => {
  const formData = new FormData()
  formData.append('orderId', orderId)
  formData.append('status', newStatus)

  const result = await updateOrderStatus(formData)
  
  if (result?.error) {
    toast.error('Error: ' + result.error)
  } else {
    toast.success(`Order status updated to ${newStatus}`)
  }
}

const handleDeleteOrder = async (orderId: string, orderName: string) => {
  if (!confirm(`Are you sure you want to delete the order "${orderName}"? This action cannot be undone.`)) {
    return
  }

  const formData = new FormData()
  formData.append('orderId', orderId)

  const result = await deleteOrder(formData)
  
  if (result?.error) {
    toast.error('Error: ' + result.error)
  } else {
    toast.success('Order deleted successfully')
  }
}

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "name",
    header: "Order Name",
    cell: ({ row }) => {
      const order = row.original
      return (
        <div>
          <Link href={`/orders/${order.id}/edit`}>
            <button className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left">
              {order.name}
            </button>
          </Link>
          <div className="text-sm text-gray-500">
            {order._count.items} item{order._count.items !== 1 ? 's' : ''}
            {order._count.documents > 0 && (
              <span className="ml-2">• {order._count.documents} doc{order._count.documents !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "supplier.name",
    header: "Supplier",
    cell: ({ row }) => {
      const supplier = row.original.supplier
      return (
        <div>
          <div className="font-medium">{supplier.name}</div>
          {supplier.contactName && (
            <div className="text-sm text-gray-500">{supplier.contactName}</div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge className={`${getStatusColor(status)} flex items-center gap-1 w-fit`}>
          {getStatusIcon(status)}
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "requestedBy",
    header: "Requested By",
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"))
      const delivery = row.original.deliveryCost
      
      return (
        <div className="text-right">
          <div className="font-medium">£{amount.toFixed(2)}</div>
          {delivery > 0 && (
            <div className="text-sm text-gray-500">+£{delivery.toFixed(2)} delivery</div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return (
        <div className="text-sm">
          {`${year}-${month}-${day}`}
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const order = row.original
      const currentStatus = order.status

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {currentStatus !== 'Quotes' && (
              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'Quotes')}>
                <FileText className="mr-2 h-4 w-4" />
                Mark as Quotes
              </DropdownMenuItem>
            )}
            {currentStatus !== 'Ordered' && currentStatus !== 'Request' && (
              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'Ordered')}>
                <Package className="mr-2 h-4 w-4" />
                Mark as Ordered
              </DropdownMenuItem>
            )}
            {currentStatus !== 'Delivered' && currentStatus !== 'Request' && (
              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'Delivered')}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Delivered
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => handleDeleteOrder(order.id, order.name)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
