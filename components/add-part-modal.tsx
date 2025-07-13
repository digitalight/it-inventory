// components/add-part-modal.tsx
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
import { Plus } from "lucide-react";
import { createPart } from "@/app/parts/actions";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface AddPartModalProps {
  categories: Category[];
}

export function AddPartModal({ categories }: AddPartModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = await createPart(formData);
      if (result.success) {
        toast.success("Part created successfully!");
        setOpen(false);
        // Reset form
        const form = document.getElementById('add-part-form') as HTMLFormElement;
        form?.reset();
      } else {
        toast.error(result.error || "Failed to create part");
      }
    } catch {
      toast.error("Failed to create part");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Part
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Part</DialogTitle>
          <DialogDescription>
            Add a new part to your inventory. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <form id="add-part-form" action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Part Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter part name"
                required
              />
            </div>
            <div>
              <Label htmlFor="partNumber">Part Number</Label>
              <Input
                id="partNumber"
                name="partNumber"
                placeholder="e.g., KB-001"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="categoryId">Category *</Label>
            <Select name="categoryId" required>
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
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Part description..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stockLevel">Initial Stock</Label>
              <Input
                id="stockLevel"
                name="stockLevel"
                type="number"
                min="0"
                defaultValue="0"
              />
            </div>
            <div>
              <Label htmlFor="minStockLevel">Minimum Stock</Label>
              <Input
                id="minStockLevel"
                name="minStockLevel"
                type="number"
                min="0"
                defaultValue="5"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="location">Storage Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g., Shelf A-1, Room 101"
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
              {loading ? "Creating..." : "Create Part"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
