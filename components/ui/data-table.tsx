"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  showSearch?: boolean
  searchPlaceholder?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  showSearch = true,
  searchPlaceholder = "Search...",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<string>("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      
      // Get all column values safely
      const values: string[] = []
      
      // Try to get common fields for all entities
      try {
        const id = row.getValue("id")
        if (id) values.push(String(id).toLowerCase())
      } catch {}
      
      try {
        const name = row.getValue("name")
        if (name) values.push(String(name).toLowerCase())
      } catch {}
      
      // Try to get laptop fields
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
        const deviceName = row.getValue("deviceName")
        if (deviceName) values.push(String(deviceName).toLowerCase())
      } catch {}
      
      try {
        const status = row.getValue("status")
        if (status) values.push(String(status).toLowerCase())
      } catch {}
      
      // Try to get staff fields
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
      
      // Try to get parts fields
      try {
        const partNumber = row.getValue("partNumber")
        if (partNumber) values.push(String(partNumber).toLowerCase())
      } catch {}
      
      try {
        const category = row.getValue("category")
        if (category && typeof category === 'object') {
          const categoryObj = category as { name?: string }
          if (categoryObj.name) values.push(String(categoryObj.name).toLowerCase())
        } else if (category) {
          values.push(String(category).toLowerCase())
        }
      } catch {}
      
      try {
        const location = row.getValue("location")
        if (location) values.push(String(location).toLowerCase())
      } catch {}
      
      // Search across all available values
      return values.some(value => value.includes(searchValue))
    },
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
      globalFilter: "",
    },
  })

  return (
    <div className="w-full h-full flex flex-col">
      {showSearch && (
        <div className="flex items-center py-4 gap-4 w-full">
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
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
            {table.getCoreRowModel().rows.length} item(s) shown
          </div>
        </div>
      )}
      <div className="rounded-md border flex-1 overflow-auto w-full">
        <Table className="w-full">
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
      
      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4 w-full">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()} ({table.getFilteredRowModel().rows.length} total items)
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
