// lib/parts-management.ts
import { prisma } from './prisma';

export class PartsManager {
  /**
   * Get all categories
   */
  static async getCategories() {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { parts: true }
        }
      }
    });
  }

  /**
   * Create a new category
   */
  static async createCategory(data: { name: string; description?: string }) {
    return await prisma.category.create({
      data
    });
  }

  /**
   * Get all parts with category information
   */
  static async getParts() {
    return await prisma.part.findMany({
      include: {
        category: true
      },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Get parts that are out of stock (below minimum stock level)
   */
  static async getOutOfStockParts() {
    const parts = await prisma.part.findMany({
      include: {
        category: true
      },
      orderBy: { name: 'asc' }
    });

    // Filter parts where stock is at or below minimum
    return parts.filter(part => part.stockLevel <= part.minStockLevel);
  }

  /**
   * Create a new part
   */
  static async createPart(data: {
    name: string;
    description?: string;
    categoryId: string;
    stockLevel?: number;
    minStockLevel?: number;
    location?: string;
    partNumber?: string;
  }) {
    const part = await prisma.part.create({
      data,
      include: { category: true }
    });

    // Create initial stock history entry
    if (data.stockLevel && data.stockLevel > 0) {
      await this.recordStockChange({
        partId: part.id,
        changeType: 'IN',
        quantity: data.stockLevel,
        previousStock: 0,
        newStock: data.stockLevel,
        reason: 'Initial stock',
        changedBy: 'System'
      });
    }

    return part;
  }

  /**
   * Update part stock level
   */
  static async updatePartStock(
    partId: string,
    quantity: number,
    changeType: 'IN' | 'OUT' | 'ADJUSTMENT',
    options: {
      reason?: string;
      changedBy?: string;
      notes?: string;
    } = {}
  ) {
    const part = await prisma.part.findUnique({
      where: { id: partId }
    });

    if (!part) {
      throw new Error('Part not found');
    }

    const previousStock = part.stockLevel;
    let newStock: number;

    switch (changeType) {
      case 'IN':
        newStock = previousStock + Math.abs(quantity);
        break;
      case 'OUT':
        newStock = Math.max(0, previousStock - Math.abs(quantity));
        break;
      case 'ADJUSTMENT':
        newStock = Math.max(0, quantity);
        break;
      default:
        throw new Error('Invalid change type');
    }

    // Update part stock
    const updatedPart = await prisma.part.update({
      where: { id: partId },
      data: { 
        stockLevel: newStock,
        updatedAt: new Date()
      },
      include: { category: true }
    });

    // Record stock history
    await this.recordStockChange({
      partId,
      changeType,
      quantity: changeType === 'OUT' ? -Math.abs(quantity) : Math.abs(quantity),
      previousStock,
      newStock,
      reason: options.reason,
      changedBy: options.changedBy,
      notes: options.notes
    });

    return updatedPart;
  }

  /**
   * Record stock change history
   */
  private static async recordStockChange(data: {
    partId: string;
    changeType: string;
    quantity: number;
    previousStock: number;
    newStock: number;
    reason?: string;
    changedBy?: string;
    notes?: string;
  }) {
    return await prisma.partStockHistory.create({
      data
    });
  }

  /**
   * Get part stock history
   */
  static async getPartStockHistory(partId: string) {
    return await prisma.partStockHistory.findMany({
      where: { partId },
      orderBy: { changedAt: 'desc' }
    });
  }

  /**
   * Get dashboard stats for parts
   */
  static async getPartsStats() {
    const [
      totalParts,
      outOfStockCount,
      totalCategories,
      allParts
    ] = await Promise.all([
      prisma.part.count(),
      prisma.part.count({
        where: {
          stockLevel: 0
        }
      }),
      prisma.category.count(),
      prisma.part.findMany({
        select: {
          stockLevel: true,
          minStockLevel: true
        }
      })
    ]);

    // Calculate low stock count in memory
    const lowStockCount = allParts.filter(part => 
      part.stockLevel > 0 && part.stockLevel <= part.minStockLevel
    ).length;

    return {
      totalParts,
      outOfStockCount,
      lowStockCount,
      totalCategories
    };
  }

  /**
   * Search parts by name or part number
   */
  static async searchParts(query: string) {
    return await prisma.part.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { partNumber: { contains: query } },
          { description: { contains: query } }
        ]
      },
      include: {
        category: true
      },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Update an existing category
   */
  static async updateCategory(
    id: string,
    data: {
      name?: string;
      description?: string;
    }
  ) {
    return await prisma.category.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Get a single category by ID
   */
  static async getCategoryById(id: string) {
    return await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { parts: true }
        }
      }
    });
  }

  /**
   * Delete a category
   */
  static async deleteCategory(id: string) {
    return await prisma.category.delete({
      where: { id }
    });
  }

  /**
   * Update an existing part
   */
  static async updatePart(
    id: string,
    data: {
      name?: string;
      description?: string;
      categoryId?: string;
      stockLevel?: number;
      minStockLevel?: number;
      location?: string;
      partNumber?: string;
    }
  ) {
    return await prisma.part.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: { category: true }
    });
  }

  /**
   * Get a single part by ID
   */
  static async getPartById(id: string) {
    return await prisma.part.findUnique({
      where: { id },
      include: {
        category: true,
        stockHistory: {
          orderBy: { changedAt: 'desc' }
        }
      }
    });
  }

  /**
   * Delete a part
   */
  static async deletePart(id: string) {
    // Delete all related stock history first (if needed, or use CASCADE)
    await prisma.partStockHistory.deleteMany({
      where: { partId: id }
    });

    // Delete the part
    return await prisma.part.delete({
      where: { id }
    });
  }

}
