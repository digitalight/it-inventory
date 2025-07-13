// app/dashboard/actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import { PartsManager } from '@/lib/parts-management';

export async function getDashboardStats() {
  try {
    // Card 1: Number of laptops assigned
    const assignedLaptops = await prisma.laptop.count({
      where: {
        status: 'Assigned'
      }
    });

    // Card 2: Number of current staff (not leaving or leaving date is in the future)
    const currentStaff = await prisma.staff.count({
      where: {
        OR: [
          { leavingDate: null },
          { leavingDate: { gt: new Date() } }
        ]
      }
    });

    // Card 3: Number of laptops in for repair
    const laptopsInRepair = await prisma.laptop.count({
      where: {
        status: 'In Repair'
      }
    });

    // Card 4: Number of assigned laptops with staff leaving in the next 3 months
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const laptopsWithLeavingStaff = await prisma.laptop.count({
      where: {
        status: 'Assigned',
        assignedTo: {
          leavingDate: {
            gte: new Date(),
            lte: threeMonthsFromNow
          }
        }
      }
    });

    // Additional metric: Returned laptops (awaiting wiping)
    const returnedLaptops = await prisma.laptop.count({
      where: {
        status: 'Returned'
      }
    });

    // Parts stats
    const partsStats = await PartsManager.getPartsStats();

    return {
      assignedLaptops,
      currentStaff,
      laptopsInRepair,
      laptopsWithLeavingStaff,
      returnedLaptops,
      ...partsStats
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      assignedLaptops: 0,
      currentStaff: 0,
      laptopsInRepair: 0,
      laptopsWithLeavingStaff: 0,
      returnedLaptops: 0,
      totalParts: 0,
      outOfStockCount: 0,
      lowStockCount: 0,
      totalCategories: 0
    };
  }
}

export async function getLeavingStaff() {
  try {
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const leavingStaff = await prisma.staff.findMany({
      where: {
        leavingDate: {
          gte: new Date(),
          lte: threeMonthsFromNow
        }
      },
      include: {
        laptops: {
          where: {
            status: 'Assigned'
          }
        }
      },
      orderBy: {
        leavingDate: 'asc'
      }
    });

    return leavingStaff;
  } catch (error) {
    console.error("Failed to fetch leaving staff:", error);
    return [];
  }
}
