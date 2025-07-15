// app/parts/actions.ts
"use server";

import { PartsManager } from "@/lib/parts-management";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getParts() {
  try {
    return await PartsManager.getParts();
  } catch (error) {
    console.error('Failed to get parts:', error);
    return [];
  }
}

export async function getCategories() {
  try {
    return await PartsManager.getCategories();
  } catch (error) {
    console.error('Failed to get categories:', error);
    return [];
  }
}

export async function getOutOfStockParts() {
  try {
    return await PartsManager.getOutOfStockParts();
  } catch (error) {
    console.error('Failed to get out of stock parts:', error);
    return [];
  }
}

export async function getPartsStats() {
  try {
    return await PartsManager.getPartsStats();
  } catch (error) {
    console.error('Failed to get parts stats:', error);
    return {
      totalParts: 0,
      outOfStockCount: 0,
      lowStockCount: 0,
      totalCategories: 0
    };
  }
}

export async function createCategory(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    
    if (!name?.trim()) {
      return { success: false, error: 'Category name is required' };
    }
    
    await PartsManager.createCategory({
      name: name.trim(),
      description: description?.trim() || undefined
    });
    
    revalidatePath('/parts');
    return { success: true };
  } catch (error) {
    console.error('Failed to create category:', error);
    return { success: false, error: 'Failed to create category' };
  }
}

export async function createPart(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const stockLevel = parseInt(formData.get('stockLevel') as string) || 0;
    const minStockLevel = parseInt(formData.get('minStockLevel') as string) || 0;
    const location = formData.get('location') as string;
    const partNumber = formData.get('partNumber') as string;
    
    if (!name?.trim()) {
      return { success: false, error: 'Part name is required' };
    }
    
    if (!categoryId) {
      return { success: false, error: 'Category is required' };
    }
    
    await PartsManager.createPart({
      name: name.trim(),
      description: description?.trim() || undefined,
      categoryId,
      stockLevel,
      minStockLevel,
      location: location?.trim() || undefined,
      partNumber: partNumber?.trim() || undefined
    });
    
    revalidatePath('/parts');
    return { success: true };
  } catch (error) {
    console.error('Failed to create part:', error);
    return { success: false, error: 'Failed to create part' };
  }
}

export async function takeOutPart(formData: FormData) {
  try {
    const partId = formData.get('partId') as string;
    const quantity = parseInt(formData.get('quantity') as string) || 1;
    const reason = formData.get('reason') as string;
    const changedBy = formData.get('changedBy') as string;
    const notes = formData.get('notes') as string;
    
    if (!partId) {
      return { success: false, error: 'Part ID is required' };
    }
    
    if (quantity <= 0) {
      return { success: false, error: 'Quantity must be greater than 0' };
    }
    
    await PartsManager.updatePartStock(partId, quantity, 'OUT', {
      reason: reason?.trim() || undefined,
      changedBy: changedBy?.trim() || 'Unknown',
      notes: notes?.trim() || undefined
    });
    
    revalidatePath('/parts');
    return { success: true };
  } catch (error) {
    console.error('Failed to take out part:', error);
    return { success: false, error: 'Failed to update part stock' };
  }
}

export async function addStock(formData: FormData) {
  try {
    const partId = formData.get('partId') as string;
    const quantity = parseInt(formData.get('quantity') as string) || 1;
    const reason = formData.get('reason') as string;
    const changedBy = formData.get('changedBy') as string;
    const notes = formData.get('notes') as string;
    
    if (!partId) {
      return { success: false, error: 'Part ID is required' };
    }
    
    if (quantity <= 0) {
      return { success: false, error: 'Quantity must be greater than 0' };
    }
    
    await PartsManager.updatePartStock(partId, quantity, 'IN', {
      reason: reason?.trim() || undefined,
      changedBy: changedBy?.trim() || 'Unknown',
      notes: notes?.trim() || undefined
    });
    
    revalidatePath('/parts');
    return { success: true };
  } catch (error) {
    console.error('Failed to add stock:', error);
    return { success: false, error: 'Failed to update part stock' };
  }
}

export async function updateCategory(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    
    if (!id) {
      return { success: false, error: 'Category ID is required' };
    }
    
    if (!name?.trim()) {
      return { success: false, error: 'Category name is required' };
    }
    
    await PartsManager.updateCategory(id, {
      name: name.trim(),
      description: description?.trim() || undefined
    });
    
    revalidatePath('/parts');
    return { success: true };
  } catch (error) {
    console.error('Failed to update category:', error);
    return { success: false, error: 'Failed to update category' };
  }
}

export async function deleteCategory(id: string) {
  try {
    if (!id) {
      return { success: false, error: 'Category ID is required' };
    }
    
    // Check if category has any parts
    const category = await PartsManager.getCategoryById(id);
    if (!category) {
      return { success: false, error: 'Category not found' };
    }
    
    if (category._count.parts > 0) {
      return { success: false, error: 'Cannot delete category with existing parts' };
    }
    
    await PartsManager.deleteCategory(id);
    
    revalidatePath('/parts');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete category:', error);
    return { success: false, error: 'Failed to delete category' };
  }
}

export async function updatePart(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const stockLevel = parseInt(formData.get('stockLevel') as string) || 0;
    const minStockLevel = parseInt(formData.get('minStockLevel') as string) || 0;
    const location = formData.get('location') as string;
    const partNumber = formData.get('partNumber') as string;
    
    if (!id) {
      return { success: false, error: 'Part ID is required' };
    }
    
    if (!name?.trim()) {
      return { success: false, error: 'Part name is required' };
    }
    
    if (!categoryId) {
      return { success: false, error: 'Category is required' };
    }
    
    await PartsManager.updatePart(id, {
      name: name.trim(),
      description: description?.trim() || undefined,
      categoryId,
      stockLevel,
      minStockLevel,
      location: location?.trim() || undefined,
      partNumber: partNumber?.trim() || undefined
    });
    
    revalidatePath('/parts');
    return { success: true };
  } catch (error) {
    console.error('Failed to update part:', error);
    return { success: false, error: 'Failed to update part' };
  }
}

export async function deletePart(id: string) {
  try {
    if (!id) {
      return { success: false, error: 'Part ID is required' };
    }
    
    // Check if part exists
    const part = await PartsManager.getPartById(id);
    if (!part) {
      return { success: false, error: 'Part not found' };
    }
    
    await PartsManager.deletePart(id);
    
    revalidatePath('/parts');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete part:', error);
    return { success: false, error: 'Failed to delete part' };
  }
}

export async function getPartsWithOrderInfo() {
  try {
    // Get all parts first
    const parts = await prisma.part.findMany({
      include: {
        category: true
      },
      orderBy: { name: 'asc' }
    });

    // For each part, get pending order quantities using raw SQL
    const partsWithOrderInfo = await Promise.all(
      parts.map(async (part) => {
        try {
          // Use raw query to get order items for this part
          const orderItems = await prisma.$queryRaw`
            SELECT 
              oi.quantity,
              oi.unitPrice,
              o.id as orderId,
              o.name as orderName,
              o.status
            FROM OrderItem oi
            JOIN "Order" o ON oi.orderId = o.id
            WHERE oi.partId = ${part.id}
            AND o.status IN ('Request', 'Quotes', 'Ordered')
          ` as Array<{
            quantity: number;
            unitPrice: number;
            orderId: string;
            orderName: string;
            status: string;
          }>;

          const onOrderQuantity = orderItems.reduce((total, item) => total + item.quantity, 0);
          const pendingOrders = orderItems.map(item => ({
            orderId: item.orderId,
            orderName: item.orderName,
            quantity: item.quantity,
            status: item.status,
            unitPrice: item.unitPrice
          }));

          return {
            ...part,
            onOrderQuantity,
            pendingOrders
          };
        } catch (itemError) {
          console.error(`Error getting orders for part ${part.id}:`, itemError);
          return {
            ...part,
            onOrderQuantity: 0,
            pendingOrders: []
          };
        }
      })
    );

    return partsWithOrderInfo;
  } catch (error) {
    console.error('Failed to get parts with order info:', error);
    // Fall back to regular parts if there's an error
    try {
      const parts = await prisma.part.findMany({
        include: {
          category: true
        },
        orderBy: { name: 'asc' }
      });
      
      return parts.map(part => ({
        ...part,
        onOrderQuantity: 0,
        pendingOrders: []
      }));
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError);
      return [];
    }
  }
}
