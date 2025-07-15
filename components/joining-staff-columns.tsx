// components/joining-staff-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

// Define the type for joining staff with laptops
export type JoiningStaffWithLaptops = {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  department: string | null;
  startDate: Date;
  laptops: {
    id: string;
    make: string;
    model: string;
    serialNumber: string;
  }[];
};

export const joiningStaffColumns: ColumnDef<JoiningStaffWithLaptops>[] = [
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
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      const startDate = row.getValue("startDate") as Date;
      
      const today = new Date();
      const diffTime = startDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let variant: "default" | "destructive" | "outline" | "secondary" = "default";
      if (diffDays <= 7) variant = "secondary";
      else if (diffDays <= 30) variant = "default";
      
      return (
        <div>
          <div className="font-medium">
            {startDate.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </div>
          <Badge variant={variant} className="text-xs">
            {diffDays > 0 ? `in ${diffDays} days` : diffDays === 0 ? 'Today' : `${Math.abs(diffDays)} days ago`}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "laptops",
    header: "Current Laptops",
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
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const staff = row.original;
      const today = new Date();
      const startDate = new Date(staff.startDate);
      
      if (startDate <= today) {
        return <Badge variant="secondary">Started</Badge>;
      } else {
        return <Badge variant="outline">Joining Soon</Badge>;
      }
    },
  },
];
