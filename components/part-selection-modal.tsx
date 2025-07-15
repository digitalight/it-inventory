"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/ui/data-table"
import { getParts } from "@/app/parts/actions"
import { toast } from "sonner"
import { CheckCircle } from "lucide-react"

interface Part {
  id: string
  name: string
  description: string | null
  partNumber: string | null
  stockLevel: number
  location: string | null
  category: {
    name: string
  }
}

interface PartSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onPartSelected: (part: Part, quantity: number, unitPrice: number) => void
}

export function PartSelectionModal({ isOpen, onClose, onPartSelected }: PartSelectionModalProps) {
  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)

  // Load parts when modal opens
  useEffect(() => {
    if (isOpen) {
      loadParts()
    }
  }, [isOpen])

  const loadParts = async () => {
    setLoading(true)
    try {
      const partsData = await getParts()
      setParts(partsData)
    } catch (error) {
      console.error('Failed to load parts:', error)
      toast.error("Failed to load parts")
    } finally {
      setLoading(false)
    }
  }

  const handlePartSelect = (part: Part) => {
    setSelectedPart(part)
  }

  const handleAddPart = () => {
    if (!selectedPart) {
      toast.error("Please select a part")
      return
    }

    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0")
      return
    }

    if (unitPrice < 0) {
      toast.error("Unit price cannot be negative")
      return
    }

    onPartSelected(selectedPart, quantity, unitPrice)
    
    // Reset form
    setSelectedPart(null)
    setQuantity(1)
    setUnitPrice(0)
    onClose()
    
    toast.success(`Added ${selectedPart.name} to order`)
  }

  const handleClose = () => {
    setSelectedPart(null)
    setQuantity(1)
    setUnitPrice(0)
    onClose()
  }

  // Create columns for parts table
  const columns = [
    {
      accessorKey: "select",
      header: "Select",
      cell: ({ row }: { row: { original: Part } }) => {
        const part = row.original
        return (
          <Button
            variant={selectedPart?.id === part.id ? "default" : "outline"}
            size="sm"
            onClick={() => handlePartSelect(part)}
          >
            {selectedPart?.id === part.id ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Selected
              </>
            ) : (
              "Select"
            )}
          </Button>
        )
      },
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "partNumber",
      header: "Part Number",
      cell: ({ row }: { row: { getValue: (key: string) => string | null } }) => row.getValue("partNumber") || "-",
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: { row: { getValue: (key: string) => { name: string } } }) => {
        const category = row.getValue("category")
        return category?.name || "-"
      },
    },
    {
      accessorKey: "stockLevel",
      header: "Stock Level",
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }: { row: { getValue: (key: string) => string | null } }) => row.getValue("location") || "-",
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="!fixed !inset-0 !max-w-none !max-h-none !w-screen !h-screen !m-0 !p-0 !gap-0 !top-0 !left-0 !transform-none !translate-x-0 !translate-y-0 !rounded-none !border-0 overflow-hidden"
        showCloseButton={false}
      >
        <div className="flex flex-col h-full w-full">
          {/* Header */}
          <DialogHeader className="p-6 border-b bg-white flex-shrink-0">
            <DialogTitle className="text-2xl">Add Part to Order</DialogTitle>
            <DialogDescription className="text-base">
              Select a part from your inventory to add to this order.
            </DialogDescription>
          </DialogHeader>
          
          {/* Main Content */}
          <div className="flex-1 overflow-hidden p-6 w-full">
            <div className="h-full w-full flex flex-col lg:flex-row gap-6">
              {/* Parts Selection Table - Takes up most space */}
              <div className="flex-1 flex flex-col min-h-0 w-full lg:w-auto">
                <div className="mb-4 flex-shrink-0">
                  <h3 className="text-lg font-semibold">Select Part</h3>
                  <p className="text-sm text-gray-600">Browse and select a part from your inventory</p>
                </div>
                {loading ? (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      Loading parts...
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 border rounded-lg overflow-hidden w-full">
                    <DataTable
                      columns={columns}
                      data={parts}
                      searchPlaceholder="Search parts by name, part number, or category..."
                    />
                  </div>
                )}
              </div>

              {/* Sidebar for Selected Part Details and Form */}
              <div className="lg:w-96 w-full flex flex-col flex-shrink-0">
                {selectedPart ? (
                  <div className="space-y-6 w-full">
                    {/* Selected Part Info */}
                    <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg w-full">
                      <div className="flex items-start gap-3 mb-4">
                        <CheckCircle className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg truncate">{selectedPart.name}</h4>
                          {selectedPart.partNumber && (
                            <p className="text-sm text-gray-600 truncate">Part #: {selectedPart.partNumber}</p>
                          )}
                          <p className="text-sm text-blue-600 font-medium truncate">
                            Category: {selectedPart.category.name}
                          </p>
                        </div>
                      </div>
                      
                      {selectedPart.description && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                          <p className="text-sm text-gray-600 break-words">{selectedPart.description}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Stock Level:</p>
                          <p className={`font-semibold ${selectedPart.stockLevel > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedPart.stockLevel} units
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Location:</p>
                          <p className="text-gray-600 truncate">{selectedPart.location || "Not specified"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Details Form */}
                    <div className="space-y-4 p-6 border border-gray-200 rounded-lg bg-white w-full">
                      <h4 className="font-semibold text-lg">Order Details</h4>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="quantity" className="text-base font-medium">Quantity *</Label>
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            required
                            className="text-base w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="unitPrice" className="text-base font-medium">Unit Price (£)</Label>
                          <Input
                            id="unitPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            value={unitPrice}
                            onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="text-base w-full"
                          />
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="pt-4 border-t">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Quantity:</span>
                            <span className="font-medium">{quantity} units</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Unit Price:</span>
                            <span className="font-medium">£{unitPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2 font-semibold">
                            <span>Total:</span>
                            <span className="text-blue-600">£{(quantity * unitPrice).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200 w-full">
                    <div className="space-y-2">
                      <p className="font-medium">No Part Selected</p>
                      <p className="text-sm">Select a part from the table to view details and configure order quantity.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50 flex justify-between items-center flex-shrink-0 w-full">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              size="lg"
              className="mr-auto"
            >
              ✕ Close
            </Button>
            <div className="flex space-x-3">
              <Button 
                onClick={handleAddPart} 
                disabled={!selectedPart || quantity <= 0}
                size="lg"
                className="px-8"
              >
                Add to Order
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
