// app/parts/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Package, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { AddStockModal } from "@/components/add-stock-modal";
import { TakeOutPartModal } from "@/components/take-out-part-modal";
import { PartHistoryModal } from "@/components/part-history-modal";
import { EditPartModal } from "@/components/edit-part-modal";
import { DeletePartModal } from "@/components/delete-part-modal";

// Type for the parts table
export type PartWithCategory = {
  id: string;
  name: string;
  description?: string | null;
  stockLevel: number;
  minStockLevel: number;
  location?: string | null;
  partNumber?: string | null;
  category: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

function getStockBadgeVariant(stockLevel: number, minStockLevel: number) {
  if (stockLevel === 0) return "destructive";
  if (stockLevel <= minStockLevel) return "secondary";
  return "default";
}

function getStockStatusText(stockLevel: number, minStockLevel: number) {
  if (stockLevel === 0) return "Out of Stock";
  if (stockLevel <= minStockLevel) return "Low Stock";
  return "In Stock";
}

export function createPartsColumns(categories: Array<{ id: string; name: string }>): ColumnDef<PartWithCategory>[] {
  return [
  {
    accessorKey: "name",
    header: "Part Name",
    cell: ({ row }) => {
      const part = row.original;
      return (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium">{part.name}</div>
            {part.partNumber && (
              <div className="text-sm text-gray-500">#{part.partNumber}</div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category.name",
    header: "Category",
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="font-normal">
          {row.original.category.name}
        </Badge>
      );
    },
  },
  {
    accessorKey: "stockLevel",
    header: "Stock Level",
    cell: ({ row }) => {
      const part = row.original;
      const variant = getStockBadgeVariant(part.stockLevel, part.minStockLevel);
      const statusText = getStockStatusText(part.stockLevel, part.minStockLevel);
      
      return (
        <div className="flex items-center gap-2">
          <Badge variant={variant} className="font-mono">
            {part.stockLevel}
          </Badge>
          {part.stockLevel <= part.minStockLevel && (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
          <div className="text-sm text-gray-500">
            {statusText}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      const location = row.original.location;
      return location ? (
        <span className="text-sm">{location}</span>
      ) : (
        <span className="text-sm text-gray-400">Not specified</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const part = row.original;
      
      return (
        <div className="flex items-center gap-2">
          <AddStockModal
            partId={part.id}
            partName={part.name}
            currentStock={part.stockLevel}
          />
          <TakeOutPartModal
            partId={part.id}
            partName={part.name}
            currentStock={part.stockLevel}
          />
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
                onClick={() => navigator.clipboard.writeText(part.id)}
              >
                Copy part ID
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <PartHistoryModal 
                  partId={part.id}
                  partName={part.name}
                  triggerButton={
                    <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                      View History
                    </div>
                  }
                />
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <EditPartModal 
                  part={{
                    id: part.id,
                    name: part.name,
                    description: part.description,
                    stockLevel: part.stockLevel,
                    minStockLevel: part.minStockLevel,
                    location: part.location,
                    partNumber: part.partNumber,
                    categoryId: part.category.id
                  }}
                  categories={categories}
                  triggerButton={
                    <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                      Edit Part
                    </div>
                  }
                />
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <DeletePartModal 
                  part={{
                    id: part.id,
                    name: part.name,
                    stockLevel: part.stockLevel
                  }}
                  triggerButton={
                    <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground text-red-600">
                      Delete Part
                    </div>
                  }
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
}

// Backward compatibility export
export const partsColumns = createPartsColumns([]);
