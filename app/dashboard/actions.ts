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

    // Card 2: Number of available laptops (ready for assignment)
    const availableLaptops = await prisma.laptop.count({
      where: {
        status: 'Available'
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
      availableLaptops,
      laptopsInRepair,
      laptopsWithLeavingStaff,
      returnedLaptops,
      ...partsStats
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      assignedLaptops: 0,
      availableLaptops: 0,
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

export async function getJoiningStaff() {
  try {
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const joiningStaff = await prisma.staff.findMany({
      where: {
        startDate: {
          gte: now,
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
        startDate: 'asc'
      }
    });

    return joiningStaff;
  } catch (error) {
    console.error("Failed to fetch joining staff:", error);
    return [];
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

export async function getLaptopsInRepair() {
  try {
    const laptopsInRepair = await prisma.laptop.findMany({
      where: {
        status: 'In Repair'
      },
      include: {
        assignedTo: {
          select: {
            firstname: true,
            lastname: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return laptopsInRepair;
  } catch (error) {
    console.error("Failed to fetch laptops in repair:", error);
    return [];
  }
}

export async function getLaptopsForWiping() {
  try {
    const laptopsForWiping = await prisma.laptop.findMany({
      where: {
        status: 'Returned'
      },
      include: {
        assignedTo: {
          select: {
            firstname: true,
            lastname: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return laptopsForWiping;
  } catch (error) {
    console.error("Failed to fetch laptops for wiping:", error);
    return [];
  }
}
