// components/laptop-list.tsx
import { Laptop, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LaptopListProps {
  laptops: Array<{
    id: string;
    serialNumber: string;
    make: string;
    model: string;
    status: string;
    assignedTo?: {
      firstname: string;
      lastname: string;
      email: string;
    } | null;
  }>;
  emptyMessage: string;
}

export function LaptopList({ laptops, emptyMessage }: LaptopListProps) {
  if (laptops.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Laptop className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {laptops.slice(0, 8).map((laptop) => (
        <div key={laptop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-3">
            <Laptop className="h-4 w-4 text-gray-500" />
            <div>
              <div className="font-medium text-sm">
                {laptop.make} {laptop.model}
              </div>
              <div className="text-xs text-gray-500">#{laptop.serialNumber}</div>
              {laptop.assignedTo && (
                <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                  <User className="h-3 w-3" />
                  {laptop.assignedTo.firstname} {laptop.assignedTo.lastname}
                </div>
              )}
            </div>
          </div>
          <Badge 
            variant={laptop.status === 'In Repair' ? 'secondary' : 'destructive'}
            className="text-xs"
          >
            {laptop.status}
          </Badge>
        </div>
      ))}
      {laptops.length > 8 && (
        <p className="text-sm text-gray-500 text-center">
          +{laptops.length - 8} more laptops
        </p>
      )}
    </div>
  );
}
