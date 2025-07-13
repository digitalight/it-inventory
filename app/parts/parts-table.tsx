// app/parts/parts-table.tsx
"use client";

import { DataTable } from "@/components/ui/data-table";
import { createPartsColumns, PartWithCategory } from "./columns";

interface PartsTableProps {
  parts: PartWithCategory[];
  categories: Array<{ id: string; name: string }>;
}

export function PartsTable({ parts, categories }: PartsTableProps) {
  const partsColumns = createPartsColumns(categories);

  return (
    <DataTable 
      columns={partsColumns} 
      data={parts} 
      searchPlaceholder="Search parts by name, ID, part number, category..."
    />
  );
}
