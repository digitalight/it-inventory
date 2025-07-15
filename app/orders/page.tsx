// app/orders/page.tsx
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { getCurrentOrders, getPastOrders } from "./actions"
import { Plus } from "lucide-react"
import Link from "next/link"
import { requireAuth } from '@/lib/auth-simple';

export default async function OrdersPage() {
  await requireAuth(); // Protect this page
  
  const [currentOrders, pastOrders] = await Promise.all([
    getCurrentOrders(),
    getPastOrders()
  ])

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground">
            Manage orders, suppliers, and track delivery status
          </p>
        </div>
        <Link href="/orders/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Order
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Current Orders</h2>
          <Suspense fallback={<div>Loading current orders...</div>}>
            <DataTable 
              columns={columns} 
              data={currentOrders} 
              searchPlaceholder="Search orders..."
            />
          </Suspense>
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Past Orders</h2>
          <Suspense fallback={<div>Loading past orders...</div>}>
            <DataTable 
              columns={columns} 
              data={pastOrders} 
              searchPlaceholder="Search past orders..."
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
