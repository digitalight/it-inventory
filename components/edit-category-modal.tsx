// components/edit-category-modal.tsx
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
import { Edit } from "lucide-react";
import { updateCategory } from "@/app/parts/actions";
import { toast } from "sonner";

interface EditCategoryModalProps {
  category: {
    id: string;
    name: string;
    description?: string;
  };
  triggerButton?: React.ReactNode;
}

export function EditCategoryModal({ category, triggerButton }: EditCategoryModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      // Add the category ID to the form data
      formData.append('id', category.id);
      
      const result = await updateCategory(formData);
      if (result.success) {
        toast.success("Category updated successfully!");
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to update category");
      }
    } catch {
      toast.error("Failed to update category");
    } finally {
      setLoading(false);
    }
  }

  const defaultTrigger = (
    <Button variant="ghost" size="sm">
      <Edit className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update the category name and description.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={category.name}
              placeholder="e.g., Storage, Memory, Graphics Cards"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={category.description || ""}
              placeholder="Brief description of this category..."
              rows={3}
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
              {loading ? "Updating..." : "Update Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
