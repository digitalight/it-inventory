// components/edit-part-modal.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";
import { updatePart } from "@/app/parts/actions";
import { toast } from "sonner";

interface EditPartModalProps {
  part: {
    id: string;
    name: string;
    description?: string | null;
    stockLevel: number;
    minStockLevel: number;
    location?: string | null;
    partNumber?: string | null;
    categoryId: string;
  };
  categories: Array<{
    id: string;
    name: string;
  }>;
  triggerButton?: React.ReactNode;
}

export function EditPartModal({ part, categories, triggerButton }: EditPartModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      // Add the part ID to the form data
      formData.append('id', part.id);
      
      const result = await updatePart(formData);
      if (result.success) {
        toast.success("Part updated successfully!");
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to update part");
      }
    } catch {
      toast.error("Failed to update part");
    } finally {
      setLoading(false);
    }
  }

  const defaultTrigger = (
    <Button variant="ghost" size="sm">
      <Edit className="mr-2 h-4 w-4" />
      Edit Part
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Part</DialogTitle>
          <DialogDescription>
            Update the part information and stock levels.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Part Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={part.name}
                placeholder="e.g., Kingston RAM 8GB DDR4"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="partNumber">Part Number</Label>
              <Input
                id="partNumber"
                name="partNumber"
                defaultValue={part.partNumber || ""}
                placeholder="e.g., KVR26N19S8/8"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={part.description || ""}
              placeholder="Brief description of the part..."
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="categoryId">Category *</Label>
            <Select name="categoryId" defaultValue={part.categoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="stockLevel">Current Stock</Label>
              <Input
                id="stockLevel"
                name="stockLevel"
                type="number"
                min="0"
                defaultValue={part.stockLevel}
              />
            </div>
            
            <div>
              <Label htmlFor="minStockLevel">Min. Stock Level</Label>
              <Input
                id="minStockLevel"
                name="minStockLevel"
                type="number"
                min="0"
                defaultValue={part.minStockLevel}
              />
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                defaultValue={part.location || ""}
                placeholder="e.g., A1, B2, Storage"
              />
            </div>
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
              {loading ? "Updating..." : "Update Part"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
