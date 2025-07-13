// lib/laptop-management.ts
import { prisma } from '@/lib/prisma';

export type LaptopStatus = 'Available' | 'Assigned' | 'In Repair' | 'Retired' | 'Returned';

interface StatusChangeOptions {
  reason?: string;
  changedBy?: string;
  notes?: string;
}

interface AssignmentChangeOptions {
  reason?: string;
  assignedBy?: string;
  notes?: string;
}

export class LaptopManager {
  /**
   * Updates laptop status with business logic validation and audit trail
   */
  static async updateLaptopStatus(
    laptopId: string, 
    newStatus: LaptopStatus, 
    options: StatusChangeOptions = {}
  ) {
    return await prisma.$transaction(async (tx) => {
      // Get current laptop
      const laptop = await tx.laptop.findUnique({
        where: { id: laptopId },
        include: { assignedTo: true }
      });

      if (!laptop) {
        throw new Error('Laptop not found');
      }

      const oldStatus = laptop.status as LaptopStatus;

      // Validate status transitions
      this.validateStatusTransition(oldStatus, newStatus, !!laptop.assignedToId);

      // Handle assignedTo based on status
      let assignedToId = laptop.assignedToId;
      
      if (newStatus === 'Available' && laptop.assignedToId) {
        // If setting to Available, must unassign
        assignedToId = null;
        
        // Record assignment history - close current assignment
        const openAssignments = await tx.laptopAssignmentHistory.findMany({
          where: {
            laptopId,
            staffId: laptop.assignedToId,
            unassignedAt: null
          }
        });

        if (openAssignments.length > 0) {
          await tx.laptopAssignmentHistory.updateMany({
            where: {
              laptopId,
              staffId: laptop.assignedToId,
              unassignedAt: null
            },
            data: {
              unassignedAt: new Date(),
              reason: options.reason || `Status changed to ${newStatus}`,
              notes: options.notes
            }
          });
        }
      } else if (newStatus === 'Retired' && laptop.assignedToId) {
        // If retiring, must unassign
        assignedToId = null;
        
        // Record assignment history - close current assignment
        await tx.laptopAssignmentHistory.updateMany({
          where: {
            laptopId,
            staffId: laptop.assignedToId,
            unassignedAt: null
          },
          data: {
            unassignedAt: new Date(),
            reason: options.reason || 'Laptop retired',
            notes: options.notes
          }
        });
      } else if (newStatus === 'Returned' && laptop.assignedToId) {
        // If returned, must unassign (laptop returned by leaving staff)
        assignedToId = null;
        
        // Record assignment history - close current assignment
        await tx.laptopAssignmentHistory.updateMany({
          where: {
            laptopId,
            staffId: laptop.assignedToId,
            unassignedAt: null
          },
          data: {
            unassignedAt: new Date(),
            reason: options.reason || 'Laptop returned by staff',
            notes: options.notes
          }
        });
      }

      // Update laptop
      const updatedLaptop = await tx.laptop.update({
        where: { id: laptopId },
        data: {
          status: newStatus,
          assignedToId,
          updatedAt: new Date()
        },
        include: { assignedTo: true }
      });

      // Record status change history
      await tx.laptopStatusHistory.create({
        data: {
          laptopId,
          fromStatus: oldStatus,
          toStatus: newStatus,
          reason: options.reason,
          changedBy: options.changedBy,
          notes: options.notes
        }
      });

      return updatedLaptop;
    });
  }

  /**
   * Gets laptop history including both status changes and assignments
   */
  static async getLaptopHistory(laptopId: string) {
    const [statusHistory, assignmentHistory] = await Promise.all([
      prisma.laptopStatusHistory.findMany({
        where: { laptopId },
        orderBy: { changedAt: 'desc' }
      }),
      prisma.laptopAssignmentHistory.findMany({
        where: { laptopId },
        include: { 
          staff: {
            select: {
              firstname: true,
              lastname: true,
              email: true
            }
          }
        },
        orderBy: { assignedAt: 'desc' }
      })
    ]);

    return { statusHistory, assignmentHistory };
  }

  /**
   * Gets staff laptop history
   */
  static async getStaffLaptopHistory(staffId: string) {
    return await prisma.laptopAssignmentHistory.findMany({
      where: { staffId },
      include: { 
        laptop: {
          select: {
            make: true,
            model: true,
            serialNumber: true
          }
        }
      },
      orderBy: { assignedAt: 'desc' }
    });
  }

  /**
   * Validates status transitions based on business rules
   */
  private static validateStatusTransition(
    fromStatus: LaptopStatus, 
    toStatus: LaptopStatus, 
    isAssigned: boolean
  ) {
    // Returned laptops can only go to Available (after wiping) or In Repair
    if (fromStatus === 'Returned' && !['Available', 'In Repair'].includes(toStatus)) {
      throw new Error('Returned laptops can only be set to Available (after wiping) or In Repair');
    }

    // Retired laptops cannot change status
    if (fromStatus === 'Retired') {
      throw new Error('Retired laptops cannot change status');
    }

    // If laptop is assigned, certain transitions require unassignment
    if (isAssigned && ['Available', 'Retired', 'Returned'].includes(toStatus)) {
      // This is handled in the updateLaptopStatus method
      console.log(`Laptop will be unassigned when changing from ${fromStatus} to ${toStatus}`);
    }
  }
}
