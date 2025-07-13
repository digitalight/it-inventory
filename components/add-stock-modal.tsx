// components/add-stock-modal.tsx
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
import { Plus } from "lucide-react";
import { addStock } from "@/app/parts/actions";
import { toast } from "sonner";

interface AddStockModalProps {
  partId: string;
  partName: string;
  currentStock: number;
  triggerButton?: React.ReactNode;
}

export function AddStockModal({ 
  partId, 
  partName, 
  currentStock,
  triggerButton 
}: AddStockModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      // Add the partId to the form data
      formData.append('partId', partId);
      
      const result = await addStock(formData);
      if (result.success) {
        toast.success("Stock added successfully!");
        setOpen(false);
        // Reset form
        const form = document.getElementById('add-stock-form') as HTMLFormElement;
        form?.reset();
      } else {
        toast.error(result.error || "Failed to add stock");
      }
    } catch {
      toast.error("Failed to add stock");
    } finally {
      setLoading(false);
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Plus className="mr-2 h-4 w-4" />
      Add Stock
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Stock: {partName}</DialogTitle>
          <DialogDescription>
            Current stock: {currentStock} units. Enter the quantity to add.
          </DialogDescription>
        </DialogHeader>
        
        <form id="add-stock-form" action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="quantity">Quantity to Add *</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              defaultValue="1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              name="reason"
              placeholder="e.g., Delivery, Purchase, Return, etc."
            />
          </div>
          
          <div>
            <Label htmlFor="changedBy">Added by</Label>
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
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Stock"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
