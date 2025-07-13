const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log("=== LAPTOP DATA ===");
    const laptops = await prisma.laptop.findMany({
      include: {
        assignedTo: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    laptops.forEach((laptop, i) => {
      console.log(
        `${i + 1}. ${laptop.make} ${laptop.model} (${laptop.serialNumber})`
      );
      console.log(`   Status: ${laptop.status}`);
      if (laptop.assignedTo) {
        console.log(
          `   Assigned to: ${laptop.assignedTo.firstname} ${laptop.assignedTo.lastname} (${laptop.assignedTo.email})`
        );
      } else {
        console.log(`   Not assigned`);
      }
      console.log("---");
    });

    console.log("\n=== ASSIGNMENT HISTORY ===");
    const history = await prisma.laptopAssignmentHistory.findMany({
      include: {
        laptop: { select: { make: true, model: true, serialNumber: true } },
        staff: { select: { firstname: true, lastname: true, email: true } },
      },
      orderBy: { assignedAt: "desc" },
      take: 10,
    });

    history.forEach((record, i) => {
      console.log(
        `${i + 1}. ${record.laptop.make} ${record.laptop.model} assigned to ${
          record.staff.firstname
        } ${record.staff.lastname}`
      );
      console.log(`   Assigned: ${record.assignedAt.toLocaleDateString()}`);
      console.log(
        `   Unassigned: ${
          record.unassignedAt
            ? record.unassignedAt.toLocaleDateString()
            : "Still assigned"
        }`
      );
      console.log("---");
    });

    console.log("\n=== STATUS HISTORY ===");
    const statusHistory = await prisma.laptopStatusHistory.findMany({
      include: {
        laptop: { select: { make: true, model: true, serialNumber: true } },
      },
      orderBy: { changedAt: "desc" },
      take: 5,
    });

    statusHistory.forEach((record, i) => {
      console.log(
        `${i + 1}. ${record.laptop.make} ${record.laptop.model}: ${
          record.fromStatus
        } → ${record.toStatus}`
      );
      console.log(`   Changed: ${record.changedAt.toLocaleDateString()}`);
      console.log(`   Reason: ${record.reason || "No reason provided"}`);
      console.log("---");
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
