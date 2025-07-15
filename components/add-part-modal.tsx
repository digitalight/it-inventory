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
import { Plus, Edit, Trash2 } from "lucide-react";
import { createPart, getCategories } from "@/app/parts/actions";
import { toast } from "sonner";
import { AddCategoryModal } from "./add-category-modal";
import { EditCategoryModal } from "./edit-category-modal";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";

interface Category {
  id: string;
  name: string;
  description?: string | null;
}

interface AddPartModalProps {
  categories: Category[];
}

export function AddPartModal({ categories: initialCategories }: AddPartModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(false);

  // Refresh categories when modal opens or after category operations
  async function refreshCategories() {
    try {
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Failed to refresh categories:', error);
    }
  }

  // Handle category deletion
  async function handleDeleteCategory() {
    if (!selectedCategoryId) return;
    
    setDeletingCategory(true);
    try {
      const { deleteCategory } = await import("@/app/parts/actions");
      const result = await deleteCategory(selectedCategoryId);
      if (result.success) {
        toast.success("Category deleted successfully!");
        handleCategoryDeleted();
        setDeleteDialogOpen(false);
      } else {
        toast.error(result.error || "Failed to delete category");
      }
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeletingCategory(false);
    }
  }

  // Handle category creation success
  function handleCategoryCreated() {
    refreshCategories();
  }

  // Handle category update success
  function handleCategoryUpdated() {
    refreshCategories();
  }

  // Handle category deletion success
  function handleCategoryDeleted() {
    refreshCategories();
    // Clear selection if deleted category was selected
    setSelectedCategoryId("");
  }

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
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="categoryId">Category *</Label>
              <div className="flex items-center space-x-2">
                <AddCategoryModal 
                  triggerButton={
                    <Button type="button" variant="outline" size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  }
                  onSuccess={handleCategoryCreated}
                />
                {selectedCategoryId && (
                  <>
                    <EditCategoryModal
                      category={{
                        id: categories.find(c => c.id === selectedCategoryId)?.id || "",
                        name: categories.find(c => c.id === selectedCategoryId)?.name || "",
                        description: categories.find(c => c.id === selectedCategoryId)?.description || undefined
                      }}
                      triggerButton={
                        <Button type="button" variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      }
                      onSuccess={handleCategoryUpdated}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
            <Select 
              name="categoryId" 
              required 
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
            >
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

        {/* Delete Category Confirmation Dialog */}
        <ConfirmDeleteDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteCategory}
          title="Delete Category"
          description="Are you sure you want to delete this category? This action cannot be undone."
          itemName={categories.find(c => c.id === selectedCategoryId)?.name || ""}
          isDeleting={deletingCategory}
        />
      </DialogContent>
    </Dialog>
  );
}
