// components/complete-repair-modal.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { completeRepair } from "@/app/laptops/actions";
import { Loader2, Wrench, Package, Plus, X } from "lucide-react";

interface Part {
  id: string;
  name: string;
  stockLevel: number;
  category: {
    name: string;
  };
}

interface SelectedPart {
  partId: string;
  quantity: number;
  part: Part;
}

interface CompleteRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  laptopId: string;
  laptopName: string;
  hasAssignment: boolean;
}

export function CompleteRepairModal({ 
  isOpen, 
  onClose, 
  laptopId, 
  laptopName, 
  hasAssignment 
}: CompleteRepairModalProps) {
  const [notes, setNotes] = useState("");
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
  const [currentPartId, setCurrentPartId] = useState<string>("none");
  const [parts, setParts] = useState<Part[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load parts when modal opens
  useEffect(() => {
    if (isOpen && isMounted) {
      loadParts();
    }
  }, [isOpen, isMounted]);

  const loadParts = async () => {
    setIsLoadingParts(true);
    try {
      const response = await fetch('/api/parts');
      if (response.ok) {
        const partsData = await response.json();
        // Only show parts that have stock
        setParts(partsData.filter((part: Part) => part.stockLevel > 0));
      }
    } catch (error) {
      console.error('Failed to load parts:', error);
      toast.error('Failed to load parts list');
    } finally {
      setIsLoadingParts(false);
    }
  };

  const addPart = () => {
    if (currentPartId === "none") return;
    
    const part = parts.find(p => p.id === currentPartId);
    if (!part) return;

    // Check if part is already selected
    const existingPartIndex = selectedParts.findIndex(sp => sp.partId === currentPartId);
    
    if (existingPartIndex >= 0) {
      // Increase quantity if not exceeding stock
      const currentQuantity = selectedParts[existingPartIndex].quantity;
      if (currentQuantity < part.stockLevel) {
        const updatedParts = [...selectedParts];
        updatedParts[existingPartIndex].quantity += 1;
        setSelectedParts(updatedParts);
      } else {
        toast.error('Cannot add more than available stock');
      }
    } else {
      // Add new part
      setSelectedParts([...selectedParts, {
        partId: currentPartId,
        quantity: 1,
        part: part
      }]);
    }
    
    setCurrentPartId("none");
  };

  const removePart = (partId: string) => {
    setSelectedParts(selectedParts.filter(sp => sp.partId !== partId));
  };

  const updatePartQuantity = (partId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removePart(partId);
      return;
    }

    const part = parts.find(p => p.id === partId);
    if (!part || newQuantity > part.stockLevel) {
      toast.error('Quantity cannot exceed available stock');
      return;
    }

    setSelectedParts(selectedParts.map(sp => 
      sp.partId === partId ? { ...sp, quantity: newQuantity } : sp
    ));
  };

  const getAvailableParts = () => {
    return parts.filter(part => {
      const selectedPart = selectedParts.find(sp => sp.partId === part.id);
      return !selectedPart || selectedPart.quantity < part.stockLevel;
    });
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    
    const formData = new FormData();
    formData.append('laptopId', laptopId);
    formData.append('notes', notes);
    
    // Add multiple parts
    if (selectedParts.length > 0) {
      selectedParts.forEach((selectedPart, index) => {
        formData.append(`parts[${index}][partId]`, selectedPart.partId);
        formData.append(`parts[${index}][quantity]`, selectedPart.quantity.toString());
      });
    }

    const result = await completeRepair(formData);
    
    if (result?.error) {
      toast.error('Error: ' + result.error);
    } else {
      const statusMessage = hasAssignment ? 'assigned' : 'available';
      toast.success(`Repair completed! Laptop is now ${statusMessage} for use.`);
      onClose();
      resetForm();
    }
    
    setIsCompleting(false);
  };

  const resetForm = () => {
    setNotes("");
    setSelectedParts([]);
    setCurrentPartId("none");
  };

  const handleClose = () => {
    if (!isCompleting) {
      onClose();
      resetForm();
    }
  };

  // Prevent rendering until after hydration to avoid mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-green-600" />
            Complete Repair
          </DialogTitle>
          <DialogDescription>
            Mark this laptop as repaired and update its status. If a part was used, select it to update inventory.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900">Laptop being repaired:</h4>
            <p className="text-sm text-green-700">{laptopName}</p>
            <p className="text-xs text-green-600 mt-1">
              Will be set to: <span className="font-medium">
                {hasAssignment ? 'Assigned (back to user)' : 'Available (ready for assignment)'}
              </span>
            </p>
          </div>

          <div className="space-y-4">
            <Label>Parts Used in Repair</Label>
            
            {/* Add Part Section */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Add Part</span>
              </div>
              
              <div className="flex gap-2">
                {!isMounted ? (
                  <div className="h-10 bg-gray-100 rounded-md animate-pulse flex-1" />
                ) : (
                  <>
                    <Select value={currentPartId} onValueChange={setCurrentPartId} disabled={isCompleting}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={isLoadingParts ? "Loading parts..." : "Select a part"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select a part</SelectItem>
                        {getAvailableParts().map((part) => (
                          <SelectItem key={part.id} value={part.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{part.name}</span>
                              <div className="flex items-center gap-2 ml-2">
                                <span className="text-xs text-gray-500">({part.category.name})</span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  Stock: {part.stockLevel}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      onClick={addPart} 
                      disabled={currentPartId === "none" || isCompleting}
                      size="sm"
                      className="px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Selected Parts List */}
            {selectedParts.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Selected Parts:</span>
                {selectedParts.map((selectedPart) => (
                  <div key={selectedPart.partId} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <div>
                        <span className="font-medium text-blue-900">{selectedPart.part.name}</span>
                        <span className="text-xs text-blue-600 ml-2">({selectedPart.part.category.name})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => updatePartQuantity(selectedPart.partId, selectedPart.quantity - 1)}
                          disabled={isCompleting}
                        >
                          -
                        </Button>
                        <span className="text-sm min-w-[2rem] text-center">{selectedPart.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => updatePartQuantity(selectedPart.partId, selectedPart.quantity + 1)}
                          disabled={isCompleting || selectedPart.quantity >= selectedPart.part.stockLevel}
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        onClick={() => removePart(selectedPart.partId)}
                        disabled={isCompleting}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  Total parts: {selectedParts.reduce((sum, part) => sum + part.quantity, 0)}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Repair Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add details about the repair work performed..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isCompleting}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isCompleting}>
            Cancel
          </Button>
          <Button onClick={handleComplete} disabled={isCompleting} className="bg-green-600 hover:bg-green-700">
            {isCompleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <Wrench className="mr-2 h-4 w-4" />
                Complete Repair
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
