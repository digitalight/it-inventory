// lib/order-management.ts
import { prisma } from './prisma';

export type OrderStatus = 'Request' | 'Quotes' | 'Ordered' | 'Delivered';

export class OrderManager {
  /**
   * Get all suppliers
   */
  static async getSuppliers() {
    return await prisma.supplier.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });
  }

  /**
   * Create a new supplier
   */
  static async createSupplier(data: {
    name: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    notes?: string;
  }) {
    return await prisma.supplier.create({
      data
    });
  }

  /**
   * Get all orders with related data
   */
  static async getOrders(includeDelivered = true) {
    const whereCondition = includeDelivered ? {} : {
      status: {
        not: 'Delivered'
      }
    };

    return await prisma.order.findMany({
      where: whereCondition,
      include: {
        supplier: true,
        items: true,
        documents: true,
        _count: {
          select: {
            items: true,
            documents: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get current orders (non-delivered)
   */
  static async getCurrentOrders() {
    return this.getOrders(false);
  }

  /**
   * Get past orders (delivered)
   */
  static async getPastOrders() {
    return await prisma.order.findMany({
      where: {
        status: 'Delivered'
      },
      include: {
        supplier: true,
        items: true,
        documents: true,
        _count: {
          select: {
            items: true,
            documents: true
          }
        }
      },
      orderBy: { deliveredAt: 'desc' }
    });
  }

  /**
   * Get a single order by ID
   */
  static async getOrderById(id: string) {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: true,
        documents: true
      }
    });
  }

  /**
   * Create a new order
   */
  static async createOrder(data: {
    name: string;
    supplierId: string;
    requestedBy: string;
    deliveryCost?: number;
    notes?: string;
    items: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      notes?: string;
      partId?: string | null;
    }>;
    documents?: Array<{
      fileName: string;
      filePath: string;
      fileSize: number;
      mimeType: string;
      documentType?: string;
      uploadedBy?: string;
    }>;
  }) {
    const { items, documents } = data;
    
    // Calculate total amount
    const itemsTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalAmount = itemsTotal + (data.deliveryCost || 0);

    return await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          name: data.name,
          supplierId: data.supplierId,
          requestedBy: data.requestedBy,
          deliveryCost: data.deliveryCost || 0,
          totalAmount,
          notes: data.notes
        } as Parameters<typeof tx.order.create>[0]['data']
      });

      // Create order items
      const orderItems = await Promise.all(
        items.map(async (item) => {
          // Create order item first
          const orderItem = await tx.orderItem.create({
            data: {
              orderId: order.id,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
              notes: item.notes
            }
          });

          // If partId is provided, update it using raw SQL
          if (item.partId) {
            try {
              await tx.$executeRaw`
                UPDATE OrderItem 
                SET partId = ${item.partId} 
                WHERE id = ${orderItem.id}
              `;
            } catch (error) {
              console.error(`Failed to set partId for order item ${orderItem.id}:`, error);
              // Continue without failing the transaction
            }
          }

          return orderItem;
        })
      );

      // Create order documents if any
      let orderDocuments: any[] = [];
      if (documents && documents.length > 0) {
        orderDocuments = await Promise.all(
          documents.map(doc => 
            tx.orderDocument.create({
              data: {
                orderId: order.id,
                fileName: doc.fileName,
                filePath: doc.filePath,
                fileSize: doc.fileSize,
                mimeType: doc.mimeType,
                documentType: doc.documentType || 'Quote',
                uploadedBy: doc.uploadedBy
              }
            })
          )
        );
      }

      return { order, items: orderItems, documents: orderDocuments };
    });
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId: string, status: OrderStatus) {
    const updateData: any = { status };
    
    if (status === 'Delivered') {
      updateData.deliveredAt = new Date();
    }

    return await prisma.order.update({
      where: { id: orderId },
      data: updateData
    });
  }

  /**
   * Add document to order
   */
  static async addOrderDocument(data: {
    orderId: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    documentType?: string;
    uploadedBy?: string;
  }) {
    return await prisma.orderDocument.create({
      data
    });
  }

  /**
   * Get order statistics
   */
  static async getOrderStats() {
    const totalOrders = await prisma.order.count();
    const currentOrders = await prisma.order.count({
      where: {
        status: {
          not: 'Delivered'
        }
      }
    });
    
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    const totalValue = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      }
    });

    return {
      totalOrders,
      currentOrders,
      deliveredOrders: totalOrders - currentOrders,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      totalValue: totalValue._sum.totalAmount || 0
    };
  }

  /**
   * Update order totals (recalculate from items)
   */
  static async updateOrderTotals(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const itemsTotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalAmount = itemsTotal + order.deliveryCost;

    return await prisma.order.update({
      where: { id: orderId },
      data: { totalAmount }
    });
  }
}
