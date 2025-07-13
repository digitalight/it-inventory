// components/add-order-modal.tsx
"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Upload, Building, X } from "lucide-react"
import { createOrder, getSuppliers } from "@/app/orders/actions"
import { toast } from "sonner"
import { useEffect } from "react"
import AddSupplierModal from "./add-supplier-modal"

interface Supplier {
  id: string
  name: string
  contactName?: string | null
}

interface OrderItem {
  id: string
  partName: string
  notes: string
  quantity: number
  unitPrice: number
}

export default function AddOrderModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [orderName, setOrderName] = useState("")
  const [requestedBy, setRequestedBy] = useState("")
  const [deliveryCost, setDeliveryCost] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<OrderItem[]>([
    { id: "1", partName: "", notes: "", quantity: 1, unitPrice: 0 }
  ])
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadSuppliers = async () => {
    const supplierData = await getSuppliers()
    setSuppliers(supplierData)
  }

  useEffect(() => {
    loadSuppliers()
  }, [])

  const addItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      partName: "",
      notes: "",
      quantity: 1,
      unitPrice: 0
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const getTotalAmount = () => {
    return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0)
  }

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!orderName || !selectedSupplier || !requestedBy) {
      toast.error("Please fill in all required fields")
      return
    }

    if (items.some(item => !item.partName || item.quantity <= 0)) {
      toast.error("Please ensure all items have a name and quantity greater than 0")
      return
    }

    const formData = new FormData()
    formData.append('name', orderName)
    formData.append('supplierId', selectedSupplier)
    formData.append('requestedBy', requestedBy)
    formData.append('deliveryCost', deliveryCost || '0')
    formData.append('notes', notes)
    formData.append('items', JSON.stringify(items))

    // Add files if any
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file)
      })
      formData.append('fileCount', files.length.toString())
    }

    const result = await createOrder(formData)
    
    if (result?.error) {
      toast.error('Error: ' + result.error)
    } else {
      toast.success("Order created successfully")
      setOpen(false)
      // Reset form
      setOrderName("")
      setSelectedSupplier("")
      setRequestedBy("")
      setDeliveryCost("")
      setNotes("")
      setItems([{ id: "1", partName: "", notes: "", quantity: 1, unitPrice: 0 }])
      setFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderName">Order Name *</Label>
              <Input
                id="orderName"
                value={orderName}
                onChange={(e) => setOrderName(e.target.value)}
                placeholder="e.g., New Laptops Q1 2025"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="supplier">Supplier *</Label>
                <AddSupplierModal onSupplierAdded={loadSuppliers}>
                  <Button type="button" variant="outline" size="sm">
                    <Plus className="mr-1 h-3 w-3" />
                    Add Supplier
                  </Button>
                </AddSupplierModal>
              </div>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                      {supplier.contactName && ` (${supplier.contactName})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requestedBy">Requested By *</Label>
              <Input
                id="requestedBy"
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryCost">Delivery Cost (£)</Label>
              <Input
                id="deliveryCost"
                type="number"
                step="0.01"
                min="0"
                value={deliveryCost}
                onChange={(e) => setDeliveryCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Order Items *</Label>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
            
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                <div className="col-span-3">
                  <Label>Part Name</Label>
                  <Input
                    value={item.partName}
                    onChange={(e) => updateItem(item.id, 'partName', e.target.value)}
                    placeholder="e.g., Dell Laptop"
                    required
                  />
                </div>
                <div className="col-span-4">
                  <Label>Notes</Label>
                  <Input
                    value={item.notes}
                    onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                    placeholder="Model, specifications, etc."
                  />
                </div>
                <div className="col-span-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label>Unit Price (£)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    variant="outline"
                    size="sm"
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="text-right text-lg font-semibold">
              Total: £{getTotalAmount().toFixed(2)}
              {parseFloat(deliveryCost || '0') > 0 && (
                <span className="text-sm text-gray-500">
                  {' '}+ £{parseFloat(deliveryCost).toFixed(2)} delivery
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="files">Upload Documents (PDF, DOC, Images)</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const fileList = e.target.files
                  if (fileList) {
                    setFiles(Array.from(fileList))
                  } else {
                    setFiles([])
                  }
                }}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            
            {files && files.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  {files.length} file(s) selected:
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{file.name}</div>
                        <div className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="ml-2 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or requirements..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Order
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
