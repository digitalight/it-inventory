// components/delete-part-modal.tsx
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
import { Trash2, AlertTriangle } from "lucide-react";
import { deletePart } from "@/app/parts/actions";
import { toast } from "sonner";

interface DeletePartModalProps {
  part: {
    id: string;
    name: string;
    stockLevel: number;
  };
  triggerButton?: React.ReactNode;
}

export function DeletePartModal({ part, triggerButton }: DeletePartModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const result = await deletePart(part.id);
      if (result.success) {
        toast.success("Part deleted successfully!");
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to delete part");
      }
    } catch {
      toast.error("Failed to delete part");
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
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Part
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{part.name}&rdquo;?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-800">
                  This action cannot be undone
                </p>
                <p className="text-sm text-red-700">
                  This will permanently delete the part and all its stock history.
                  {part.stockLevel > 0 && (
                    <span className="block mt-1 font-medium">
                      Current stock: {part.stockLevel} units will be lost.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
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
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Part"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
