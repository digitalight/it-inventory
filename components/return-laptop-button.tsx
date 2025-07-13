// components/return-laptop-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { returnLaptop } from "@/app/dashboard/return-actions";
import { toast } from "sonner";
import { Undo2 } from "lucide-react";

interface ReturnLaptopButtonProps {
  laptopId: string;
  staffId: string;
  laptopInfo: string; // e.g., "MacBook Pro (SN: ABC123)"
  staffName: string;
  disabled?: boolean;
}

export function ReturnLaptopButton({ 
  laptopId, 
  staffId, 
  laptopInfo, 
  staffName,
  disabled = false 
}: ReturnLaptopButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReturn = async () => {
    setIsSubmitting(true);
    
    try {
      const result = await returnLaptop(laptopId, staffId, notes);
      
      if (result.success) {
        toast.success("Laptop returned successfully", {
          description: `${laptopInfo} has been marked as returned and unassigned from ${staffName}.`
        });
        setIsOpen(false);
        setNotes("");
      } else {
        toast.error("Failed to return laptop", {
          description: result.error
        });
      }
    } catch {
      toast.error("Failed to return laptop", {
        description: "An unexpected error occurred"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-8 px-2 text-orange-600 border-orange-200 hover:bg-orange-50"
        >
          <Undo2 className="h-3 w-3 mr-1" />
          Return
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Return Laptop</DialogTitle>
          <DialogDescription>
            Are you sure you want to mark this laptop as returned?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="text-sm">
              <div className="font-medium">{laptopInfo}</div>
              <div className="text-gray-600">Assigned to: {staffName}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="Add any notes about the laptop return..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Example: &ldquo;Laptop in good condition&rdquo; or &ldquo;Minor scratch on lid&rdquo;
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReturn}
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isSubmitting ? "Processing..." : "Return Laptop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
