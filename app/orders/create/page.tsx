"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Upload, X, ArrowLeft, Package } from "lucide-react"
import { createOrder, getSuppliers } from "@/app/orders/actions"
import { toast } from "sonner"
import AddSupplierModal from "@/components/add-supplier-modal"
import { PartSelectionModal } from "@/components/part-selection-modal"

interface Supplier {
  id: string
  name: string
  contactName?: string | null
}

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

interface OrderItem {
  id: string
  name: string
  notes: string
  quantity: number
  unitPrice: number
  totalPrice: number
  partId?: string | null // Optional reference to Part
}

export default function CreateOrderPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [orderName, setOrderName] = useState("")
  const [requestedBy, setRequestedBy] = useState("")
  const [deliveryCost, setDeliveryCost] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: "1",
      name: "",
      notes: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    }
  ])
  const [files, setFiles] = useState<File[]>([])
  const [showPartModal, setShowPartModal] = useState(false)
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
      name: "",
      notes: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice
        }
        return updatedItem
      }
      return item
    }))
  }

  const getTotalAmount = () => {
    return items.reduce((total, item) => total + item.totalPrice, 0)
  }

  const handlePartSelected = (part: Part, quantity: number, unitPrice: number) => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      name: part.name,
      notes: part.partNumber ? `Part Number: ${part.partNumber}` : "",
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
      partId: part.id
    }
    setItems([...items, newItem])
  }

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove))
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  const resetForm = () => {
    setOrderName("")
    setSelectedSupplier("")
    setRequestedBy("")
    setDeliveryCost("")
    setNotes("")
    setItems([{
      id: "1",
      name: "",
      notes: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    }])
    setFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!orderName || !selectedSupplier || !requestedBy) {
      toast.error("Please fill in all required fields")
      return
    }

    if (items.some(item => !item.name || item.quantity <= 0)) {
      toast.error("Please ensure all items have a name and quantity greater than 0")
      return
    }

    setSaving(true)
    const formData = new FormData()
    formData.append('name', orderName)
    formData.append('supplierId', selectedSupplier)
    formData.append('requestedBy', requestedBy)
    formData.append('deliveryCost', deliveryCost || '0')
    formData.append('notes', notes)
    formData.append('items', JSON.stringify(items))

    // Add files if any
    if (files.length > 0) {
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
      resetForm()
      router.push("/orders")
    }
    setSaving(false)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => router.push("/orders")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Order</h1>
            <p className="text-gray-600">Add a new order with items and documents</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Label htmlFor="supplier">Supplier *</Label>
                <div className="flex gap-2">
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier} required>
                    <SelectTrigger className="flex-1">
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
                  <AddSupplierModal onSupplierAdded={loadSuppliers}>
                    <Button type="button" variant="outline" size="sm" className="shrink-0">
                      <Plus className="mr-1 h-3 w-3" />
                      Add Supplier
                    </Button>
                  </AddSupplierModal>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order Items</CardTitle>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  onClick={() => setShowPartModal(true)} 
                  variant="outline" 
                  size="sm"
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Add Part
                </Button>
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
                <div className="col-span-12 md:col-span-3">
                  <Label>Part Name *</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    placeholder="e.g., Dell Laptop"
                    required
                  />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <Label>Notes</Label>
                  <Input
                    value={item.notes}
                    onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                    placeholder="Model, specifications, etc."
                  />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
                <div className="col-span-5 md:col-span-2">
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
            
            <div className="text-right text-xl font-semibold border-t pt-4">
              Total: £{getTotalAmount().toFixed(2)}
              {parseFloat(deliveryCost || '0') > 0 && (
                <span className="text-base text-gray-500">
                  {' '}+ £{parseFloat(deliveryCost).toFixed(2)} delivery
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="files">Upload Documents (Optional)</Label>
              <div className="flex items-center gap-4">
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
              
              {files.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    {files.length} file(s) selected:
                  </div>
                  <div className="grid gap-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{file.name}</div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="ml-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push("/orders")}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create Order"}
          </Button>
        </div>
      </form>

      {/* Part Selection Modal */}
      <PartSelectionModal
        isOpen={showPartModal}
        onClose={() => setShowPartModal(false)}
        onPartSelected={handlePartSelected}
      />
    </div>
  )
}
