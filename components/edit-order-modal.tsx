"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Upload, X, Download, FileText } from "lucide-react"
import { updateOrder, getSuppliers, getOrderById } from "@/app/orders/actions"
import { toast } from "sonner"
import AddSupplierModal from "./add-supplier-modal"

interface Supplier {
  id: string
  name: string
  contactName?: string | null
}

interface OrderItem {
  id: string
  name: string
  notes: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface OrderDocument {
  id: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  documentType: string
  uploadedBy?: string | null
  createdAt: Date
}

interface Order {
  id: string
  name: string
  supplierId: string
  supplier: {
    name: string
    contactName?: string | null
  }
  status: string
  requestedBy: string
  deliveryCost: number
  totalAmount: number
  notes?: string | null
  items: OrderItem[]
  documents: OrderDocument[]
  createdAt: Date
  updatedAt: Date
}

export default function EditOrderModal({ 
  children, 
  orderId 
}: { 
  children: React.ReactNode
  orderId: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [orderName, setOrderName] = useState("")
  const [requestedBy, setRequestedBy] = useState("")
  const [deliveryCost, setDeliveryCost] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<OrderItem[]>([])
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadSuppliers = async () => {
    const supplierData = await getSuppliers()
    setSuppliers(supplierData)
  }

  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadOrder = async () => {
    setLoading(true)
    try {
      const orderData = await getOrderById(orderId)
      if (orderData) {
        setOrder(orderData)
        setOrderName(orderData.name)
        setSelectedSupplier(orderData.supplierId)
        setRequestedBy(orderData.requestedBy)
        setDeliveryCost(orderData.deliveryCost.toString())
        setNotes(orderData.notes || "")
        setItems(orderData.items)
      }
    } catch (error) {
      console.error('Failed to load order:', error)
      toast.error("Failed to load order details")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && orderId) {
      loadOrder()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, orderId])

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

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove))
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Request':
        return 'bg-blue-100 text-blue-800'
      case 'Quotes':
        return 'bg-yellow-100 text-yellow-800'
      case 'Ordered':
        return 'bg-orange-100 text-orange-800'
      case 'Delivered':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

    const formData = new FormData()
    formData.append('orderId', orderId)
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

    const result = await updateOrder(formData)
    
    if (result?.error) {
      toast.error('Error: ' + result.error)
    } else {
      toast.success("Order updated successfully")
      setOpen(false)
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
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Edit Order</DialogTitle>
            {order && (
              <Badge className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
            )}
          </div>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">Loading order details...</div>
          </div>
        ) : (
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
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      placeholder="e.g., Dell Laptop"
                      required
                    />
                  </div>
                  <div className="col-span-4">
                    <Label>Notes</Label>
                    <Input
                      value={item.notes || ''}
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

            {/* Existing Documents */}
            {order && order.documents.length > 0 && (
              <div className="space-y-2">
                <Label>Existing Documents</Label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {order.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{doc.fileName}</div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(doc.fileSize)} • {doc.documentType}
                            {doc.uploadedBy && ` • Uploaded by ${doc.uploadedBy}`}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-6 w-6 p-0"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Documents */}
            <div className="space-y-2">
              <Label htmlFor="files">Upload Additional Documents</Label>
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
              
              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    {files.length} new file(s) selected:
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded border">
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
                Update Order
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
