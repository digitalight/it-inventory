"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      
      // Get all column values safely
      const values: string[] = []
      
      // Try to get common laptop fields
      try {
        const serialNumber = row.getValue("serialNumber")
        if (serialNumber) values.push(String(serialNumber).toLowerCase())
      } catch {}
      
      try {
        const assignedTo = row.getValue("assignedTo")
        if (assignedTo && typeof assignedTo === 'object') {
          // Handle nested assignedTo object from laptops
          const assignedToObj = assignedTo as { firstname?: string; lastname?: string; email?: string }
          if (assignedToObj.firstname) values.push(String(assignedToObj.firstname).toLowerCase())
          if (assignedToObj.lastname) values.push(String(assignedToObj.lastname).toLowerCase())
          if (assignedToObj.email) values.push(String(assignedToObj.email).toLowerCase())
          // Also add the full name
          if (assignedToObj.firstname && assignedToObj.lastname) {
            values.push(`${assignedToObj.firstname} ${assignedToObj.lastname}`.toLowerCase())
          }
        } else if (assignedTo) {
          // Handle simple assignedTo string
          values.push(String(assignedTo).toLowerCase())
        }
      } catch {}
      
      try {
        const make = row.getValue("make")
        if (make) values.push(String(make).toLowerCase())
      } catch {}
      
      try {
        const model = row.getValue("model")
        if (model) values.push(String(model).toLowerCase())
      } catch {}
      
      try {
        const status = row.getValue("status")
        if (status) values.push(String(status).toLowerCase())
      } catch {}
      
      // Try to get common staff fields (for staff pages)
      try {
        const firstname = row.getValue("firstname")
        if (firstname) values.push(String(firstname).toLowerCase())
      } catch {}
      
      try {
        const lastname = row.getValue("lastname")
        if (lastname) values.push(String(lastname).toLowerCase())
      } catch {}
      
      try {
        const department = row.getValue("department")
        if (department) values.push(String(department).toLowerCase())
      } catch {}
      
      try {
        const email = row.getValue("email")
        if (email) values.push(String(email).toLowerCase())
      } catch {}
      
      // Search across all available values
      return values.some(value => value.includes(searchValue))
    },
    state: {
      sorting,
      globalFilter,
    },
  })

  return (
    <div>
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Search laptops/staff..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
          type="text"
        />
        <Button 
          variant="outline" 
          onClick={() => setGlobalFilter("")}
          className="px-3"
        >
          Clear Search
        </Button>
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of{" "}
          {table.getCoreRowModel().rows.length} laptop(s) shown
        </div>
      </div>
      <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    </div>
  )
}
