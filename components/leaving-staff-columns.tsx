// components/leaving-staff-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

// Define the type for leaving staff with laptops
export type LeavingStaffWithLaptops = {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  department: string | null;
  leavingDate: Date | null;
  laptops: {
    id: string;
    make: string;
    model: string;
    serialNumber: string;
  }[];
};

export const leavingStaffColumns: ColumnDef<LeavingStaffWithLaptops>[] = [
  {
    accessorKey: "firstname",
    header: "Name",
    cell: ({ row }) => {
      const staff = row.original;
      return (
        <div>
          <div className="font-medium">
            {staff.firstname} {staff.lastname}
          </div>
          <div className="text-sm text-muted-foreground">
            {staff.email}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => {
      const department = row.getValue("department") as string | null;
      return department ? (
        <Badge variant="outline">{department}</Badge>
      ) : (
        <span className="text-muted-foreground">No department</span>
      );
    },
  },
  {
    accessorKey: "leavingDate",
    header: "Leaving Date",
    cell: ({ row }) => {
      const leavingDate = row.getValue("leavingDate") as Date | null;
      if (!leavingDate) return <span className="text-muted-foreground">Not set</span>;
      
      const today = new Date();
      const diffTime = leavingDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let variant: "default" | "destructive" | "outline" | "secondary" = "default";
      if (diffDays <= 30) variant = "destructive";
      else if (diffDays <= 60) variant = "secondary";
      
      return (
        <div>
          <div className="font-medium">
            {leavingDate.toLocaleDateString()}
          </div>
          <Badge variant={variant} className="text-xs">
            {diffDays} days
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "laptops",
    header: "Assigned Laptops",
    cell: ({ row }) => {
      const laptops = row.getValue("laptops") as { make: string; model: string; serialNumber: string }[];
      
      if (laptops.length === 0) {
        return <span className="text-muted-foreground">No laptops assigned</span>;
      }
      
      return (
        <div className="space-y-1">
          {laptops.map((laptop, index) => (
            <div key={index} className="text-sm">
              <div className="font-medium">
                {laptop.make} {laptop.model}
              </div>
              <div className="text-xs text-muted-foreground">
                SN: {laptop.serialNumber}
              </div>
            </div>
          ))}
        </div>
      );
    },
  },
];
