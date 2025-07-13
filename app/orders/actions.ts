// app/orders/actions.ts
'use server';

import { OrderManager, OrderStatus } from '@/lib/order-management';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { saveUploadedFiles } from '@/lib/file-upload';

interface OrderItemData {
  name: string
  notes: string
  quantity: number
  unitPrice: number
}

export async function getOrders() {
  try {
    return await OrderManager.getOrders();
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return [];
  }
}

export async function getCurrentOrders() {
  try {
    return await OrderManager.getCurrentOrders();
  } catch (error) {
    console.error('Failed to fetch current orders:', error);
    return [];
  }
}

export async function getPastOrders() {
  try {
    return await OrderManager.getPastOrders();
  } catch (error) {
    console.error('Failed to fetch past orders:', error);
    return [];
  }
}

// Supplier management functions
export async function getSuppliers() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' }
    })
    return suppliers
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return []
  }
}

export async function createSupplier(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const contactName = formData.get('contactName') as string || null
    const email = formData.get('email') as string || null
    const phone = formData.get('phone') as string || null
    const address = formData.get('address') as string || null
    const website = formData.get('website') as string || null
    const notes = formData.get('notes') as string || null

    if (!name) {
      return { error: 'Supplier name is required' }
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactName,
        email,
        phone,
        address,
        website,
        notes
      }
    })

    revalidatePath('/orders')
    return { success: true, supplier }
  } catch (error) {
    console.error('Error creating supplier:', error)
    return { error: 'Failed to create supplier' }
  }
}

export async function createOrder(formData: FormData) {
  const name = formData.get('name') as string;
  const supplierId = formData.get('supplierId') as string;
  const requestedBy = formData.get('requestedBy') as string;
  const deliveryCost = parseFloat(formData.get('deliveryCost') as string) || 0;
  const notes = formData.get('notes') as string;

  if (!name || !supplierId || !requestedBy) {
    return { error: 'Order name, supplier, and requested by are required.' };
  }

  try {
    // Parse items from form data
    // Parse items from JSON instead of FormData fields
    const itemsJson = formData.get('items') as string
    let orderItems: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      notes?: string;
    }> = [];
    
    if (itemsJson) {
      try {
        const parsedItems = JSON.parse(itemsJson)
        orderItems = parsedItems.map((item: OrderItemData) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: item.notes || undefined
        }))
      } catch (error) {
        console.error('Error parsing items JSON:', error)
        return { error: 'Invalid items data' }
      }
    }

    if (orderItems.length === 0) {
      return { error: 'At least one item is required.' };
    }

    // Handle file uploads
    const fileCount = parseInt(formData.get('fileCount') as string || '0');
    const files: File[] = [];
    
    for (let i = 0; i < fileCount; i++) {
      const file = formData.get(`file_${i}`) as File;
      if (file) {
        files.push(file);
      }
    }

    // Create the order first to get the ID
    const result = await OrderManager.createOrder({
      name,
      supplierId,
      requestedBy,
      deliveryCost,
      notes: notes || undefined,
      items: orderItems
    });

    // Handle file uploads if any
    if (files.length > 0) {
      try {
        const uploadedFiles = await saveUploadedFiles(files, result.order.id);
        
        // Create document records in database
        await Promise.all(
          uploadedFiles.map(file => 
            prisma.orderDocument.create({
              data: {
                orderId: result.order.id,
                fileName: file.fileName,
                filePath: file.filePath,
                fileSize: file.fileSize,
                mimeType: file.mimeType,
                documentType: 'Quote',
                uploadedBy: requestedBy
              }
            })
          )
        );

        // Auto-update status to "Quotes" if any PDF files were uploaded
        const hasPdfFiles = uploadedFiles.some(file => file.mimeType === 'application/pdf');
        if (hasPdfFiles) {
          await prisma.order.update({
            where: { id: result.order.id },
            data: { status: 'Quotes' }
          });
        }
      } catch (error) {
        console.error('Error uploading files:', error);
        // Order is created but files failed - continue without failing
      }
    }

    revalidatePath('/orders');
    return { success: true };
  } catch (error) {
    console.error('Error creating order:', error);
    return { error: 'Failed to create order. Please try again.' };
  }
}

export async function updateOrderStatus(formData: FormData) {
  const orderId = formData.get('orderId') as string;
  const status = formData.get('status') as OrderStatus;

  if (!orderId || !status) {
    return { error: 'Order ID and status are required.' };
  }

  try {
    await OrderManager.updateOrderStatus(orderId, status);
    revalidatePath('/orders');
    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { error: 'Failed to update order status. Please try again.' };
  }
}

export async function getOrderStats() {
  try {
    return await OrderManager.getOrderStats();
  } catch (error) {
    console.error('Failed to get order stats:', error);
    return {
      totalOrders: 0,
      currentOrders: 0,
      deliveredOrders: 0,
      ordersByStatus: {},
      totalValue: 0
    };
  }
}

export async function getOrderById(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        supplier: {
          select: {
            name: true,
            contactName: true
          }
        },
        items: {
          orderBy: { createdAt: 'asc' }
        },
        documents: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return order
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

export async function updateOrder(formData: FormData) {
  try {
    const orderId = formData.get('orderId') as string
    const name = formData.get('name') as string
    const supplierId = formData.get('supplierId') as string
    const requestedBy = formData.get('requestedBy') as string
    const deliveryCost = parseFloat(formData.get('deliveryCost') as string) || 0
    const notes = formData.get('notes') as string

    if (!orderId || !name || !supplierId || !requestedBy) {
      return { error: 'Order ID, name, supplier, and requested by are required.' }
    }

    // Parse items from JSON
    const itemsJson = formData.get('items') as string
    let items: OrderItemData[] = []
    
    if (itemsJson) {
      try {
        items = JSON.parse(itemsJson)
      } catch (error) {
        console.error('Error parsing items JSON:', error)
        return { error: 'Invalid items data' }
      }
    }

    if (items.length === 0) {
      return { error: 'At least one item is required.' }
    }

    // Calculate total amount
    const itemsTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const totalAmount = itemsTotal + deliveryCost

    // Update order and items in transaction
    await prisma.$transaction(async (tx) => {
      // Update the order
      await tx.order.update({
        where: { id: orderId },
        data: {
          name,
          supplierId,
          requestedBy,
          deliveryCost,
          totalAmount,
          notes: notes || null
        }
      })

      // Delete existing items
      await tx.orderItem.deleteMany({
        where: { orderId }
      })

      // Create new items
      await Promise.all(
        items.map(item =>
          tx.orderItem.create({
            data: {
              orderId,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
              notes: item.notes || null
            }
          })
        )
      )
    })

    // Handle file uploads if any
    const fileCount = parseInt(formData.get('fileCount') as string || '0')
    if (fileCount > 0) {
      const files: File[] = []
      
      for (let i = 0; i < fileCount; i++) {
        const file = formData.get(`file_${i}`) as File
        if (file) {
          files.push(file)
        }
      }

      if (files.length > 0) {
        try {
          const uploadedFiles = await saveUploadedFiles(files, orderId)
          
          // Create document records in database
          await Promise.all(
            uploadedFiles.map(file => 
              prisma.orderDocument.create({
                data: {
                  orderId,
                  fileName: file.fileName,
                  filePath: file.filePath,
                  fileSize: file.fileSize,
                  mimeType: file.mimeType,
                  documentType: 'Quote',
                  uploadedBy: requestedBy
                }
              })
            )
          )
        } catch (error) {
          console.error('Error uploading files:', error)
          // Continue without failing the entire update
        }

        // Auto-update status to "Quotes" if any PDF files were uploaded
        if (files.length > 0) {
          const hasPdfFiles = files.some(file => file.type === 'application/pdf');
          if (hasPdfFiles) {
            await prisma.order.update({
              where: { id: orderId },
              data: { status: 'Quotes' }
            });
          }
        }
      }
    }

    revalidatePath('/orders')
    return { success: true }
  } catch (error) {
    console.error('Error updating order:', error)
    return { error: 'Failed to update order. Please try again.' }
  }
}

export async function deleteOrder(formData: FormData) {
  try {
    const orderId = formData.get('orderId') as string

    if (!orderId) {
      return { error: 'Order ID is required' }
    }

    // Delete order (cascade will handle items and documents)
    await prisma.order.delete({
      where: { id: orderId }
    })

    revalidatePath('/orders')
    return { success: true }
  } catch (error) {
    console.error('Error deleting order:', error)
    return { error: 'Failed to delete order. Please try again.' }
  }
}

export async function deleteOrderDocument(formData: FormData) {
  try {
    const documentId = formData.get('documentId') as string

    if (!documentId) {
      return { error: 'Document ID is required' }
    }

    // Get document info before deletion for file cleanup
    const document = await prisma.orderDocument.findUnique({
      where: { id: documentId }
    })

    if (!document) {
      return { error: 'Document not found' }
    }

    // Delete document record from database
    await prisma.orderDocument.delete({
      where: { id: documentId }
    })

    // Optionally delete the physical file
    // Note: You might want to add file system cleanup here
    // const fs = require('fs').promises
    // try {
    //   await fs.unlink(document.filePath)
    // } catch (error) {
    //   console.warn('Failed to delete physical file:', error)
    // }

    revalidatePath('/orders')
    return { success: true }
  } catch (error) {
    console.error('Error deleting document:', error)
    return { error: 'Failed to delete document. Please try again.' }
  }
}
