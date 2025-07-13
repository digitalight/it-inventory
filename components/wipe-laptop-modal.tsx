// components/wipe-laptop-modal.tsx
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { wipeLaptop } from "@/app/laptops/actions";
import { Loader2, HardDrive } from "lucide-react";

interface WipeLaptopModalProps {
  isOpen: boolean;
  onClose: () => void;
  laptopId: string;
  laptopName: string;
}

export function WipeLaptopModal({ isOpen, onClose, laptopId, laptopName }: WipeLaptopModalProps) {
  const [notes, setNotes] = useState("");
  const [isWiping, setIsWiping] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleWipe = async () => {
    setIsWiping(true);
    
    const formData = new FormData();
    formData.append('laptopId', laptopId);
    formData.append('notes', notes);

    const result = await wipeLaptop(formData);
    
    if (result?.error) {
      toast.error('Error: ' + result.error);
    } else {
      toast.success('Laptop has been wiped and is now available for assignment');
      onClose();
      setNotes(""); // Reset form
    }
    
    setIsWiping(false);
  };

  const handleClose = () => {
    if (!isWiping) {
      onClose();
      setNotes(""); // Reset form when closing
    }
  };

  // Prevent rendering until after hydration to avoid mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-blue-600" />
            Confirm Laptop Wipe
          </DialogTitle>
          <DialogDescription>
            This will mark the laptop as wiped and set its status to &quot;Available&quot; for reassignment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900">Laptop to be wiped:</h4>
            <p className="text-sm text-blue-700">{laptopName}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about the wiping process..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isWiping}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isWiping}>
            Cancel
          </Button>
          <Button onClick={handleWipe} disabled={isWiping} className="bg-blue-600 hover:bg-blue-700">
            {isWiping ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wiping...
              </>
            ) : (
              <>
                <HardDrive className="mr-2 h-4 w-4" />
                Confirm Wipe
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
