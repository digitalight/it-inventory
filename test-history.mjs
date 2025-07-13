import { PrismaClient } from "@prisma/client";

async function testHistoryAPI() {
  try {
    const prisma = new PrismaClient();

    const laptops = await prisma.laptop.findMany({ take: 1 });

    if (laptops.length > 0) {
      const laptopId = laptops[0].id;
      console.log(
        `Testing history for laptop: ${laptops[0].make} ${laptops[0].model} (${laptopId})`
      );

      // Test direct database queries that the LaptopManager.getLaptopHistory would use
      const [statusHistory, assignmentHistory] = await Promise.all([
        prisma.laptopStatusHistory.findMany({
          where: { laptopId },
          orderBy: { changedAt: "desc" },
        }),
        prisma.laptopAssignmentHistory.findMany({
          where: { laptopId },
          include: {
            staff: {
              select: {
                firstname: true,
                lastname: true,
                email: true,
              },
            },
          },
          orderBy: { assignedAt: "desc" },
        }),
      ]);

      console.log("\n=== HISTORY RESULT ===");
      console.log("Status History:", statusHistory.length, "records");
      console.log("Assignment History:", assignmentHistory.length, "records");

      if (statusHistory.length > 0) {
        console.log("\nFirst status record:", statusHistory[0]);
      }

      if (assignmentHistory.length > 0) {
        console.log("\nFirst assignment record:", assignmentHistory[0]);
      }
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error testing history:", error);
  }
}

testHistoryAPI();
