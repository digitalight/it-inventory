// components/delete-category-modal.tsx
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
import { Trash2 } from "lucide-react";
import { deleteCategory } from "@/app/parts/actions";
import { toast } from "sonner";

interface DeleteCategoryModalProps {
  category: {
    id: string;
    name: string;
    _count: {
      parts: number;
    };
  };
  triggerButton?: React.ReactNode;
}

export function DeleteCategoryModal({ category, triggerButton }: DeleteCategoryModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (category._count.parts > 0) {
      toast.error("Cannot delete category with existing parts. Please move or delete all parts first.");
      return;
    }

    setLoading(true);
    try {
      const result = await deleteCategory(category.id);
      if (result.success) {
        toast.success("Category deleted successfully!");
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to delete category");
      }
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setLoading(false);
    }
  }

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
      <Trash2 className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the category &ldquo;{category.name}&rdquo;?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {category._count.parts > 0 ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Cannot delete:</strong> This category contains {category._count.parts} part(s). 
                Please move or delete all parts from this category first.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-800">
                This action cannot be undone. The category will be permanently deleted.
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={loading || category._count.parts > 0}
            >
              {loading ? "Deleting..." : "Delete Category"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
