// components/take-out-part-modal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Minus } from "lucide-react";
import { takeOutPart } from "@/app/parts/actions";
import { toast } from "sonner";

interface TakeOutPartModalProps {
  partId: string;
  partName: string;
  currentStock: number;
  triggerButton?: React.ReactNode;
}

export function TakeOutPartModal({ 
  partId, 
  partName, 
  currentStock,
  triggerButton 
}: TakeOutPartModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      // Add the partId to the form data
      formData.append('partId', partId);
      
      const result = await takeOutPart(formData);
      if (result.success) {
        toast.success("Part stock updated successfully!");
        setOpen(false);
        // Reset form
        const form = document.getElementById('take-out-form') as HTMLFormElement;
        form?.reset();
      } else {
        toast.error(result.error || "Failed to update stock");
      }
    } catch {
      toast.error("Failed to update stock");
    } finally {
      setLoading(false);
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Minus className="mr-2 h-4 w-4" />
      Take Out
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Take Out: {partName}</DialogTitle>
          <DialogDescription>
            Current stock: {currentStock} units. Enter the quantity to take out.
          </DialogDescription>
        </DialogHeader>
        
        <form id="take-out-form" action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="quantity">Quantity to Take Out *</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              max={currentStock}
              defaultValue="1"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum: {currentStock} units
            </p>
          </div>
          
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              name="reason"
              placeholder="e.g., Repair, Installation, etc."
            />
          </div>
          
          <div>
            <Label htmlFor="changedBy">Taken by</Label>
            <Input
              id="changedBy"
              name="changedBy"
              placeholder="Your name or ID"
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Additional notes..."
              rows={2}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || currentStock === 0}>
              {loading ? "Updating..." : "Take Out"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
