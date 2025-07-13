import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createRealisticHistory() {
  try {
    console.log("Creating realistic laptop assignment history...\n");

    // Get all laptops and staff
    const laptops = await prisma.laptop.findMany({
      include: { assignedTo: true },
    });

    const staff = await prisma.staff.findMany();

    // Create realistic assignment and status history for each laptop
    for (const laptop of laptops) {
      console.log(
        `Processing ${laptop.make} ${laptop.model} (${laptop.serialNumber})...`
      );

      // Create some status history (simulate laptop lifecycle)
      const baseDate = new Date(laptop.createdAt);

      // 1. Initial status when laptop was received
      await prisma.laptopStatusHistory.create({
        data: {
          laptopId: laptop.id,
          fromStatus: "Available", // When first received
          toStatus: "Available",
          reason: "Initial laptop setup and configuration",
          changedBy: "IT Department",
          changedAt: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day later
        },
      });

      // 2. If laptop is currently assigned, create assignment history
      if (laptop.assignedToId && laptop.assignedTo) {
        // Create assignment transition
        await prisma.laptopStatusHistory.create({
          data: {
            laptopId: laptop.id,
            fromStatus: "Available",
            toStatus: "Assigned",
            reason: `Assigned to ${laptop.assignedTo.firstname} ${laptop.assignedTo.lastname}`,
            changedBy: "IT Department",
            changedAt: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week later
          },
        });

        // Create assignment history record
        await prisma.laptopAssignmentHistory.create({
          data: {
            laptopId: laptop.id,
            staffId: laptop.assignedToId,
            assignedAt: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000),
            assignedBy: "IT Department",
            reason: "New staff member laptop assignment",
            notes: "Standard laptop setup with required software",
          },
        });

        console.log(
          `  ✓ Created assignment history for ${laptop.assignedTo.firstname} ${laptop.assignedTo.lastname}`
        );
      }

      // 3. If laptop has special status, create additional history
      if (laptop.status === "In Repair") {
        await prisma.laptopStatusHistory.create({
          data: {
            laptopId: laptop.id,
            fromStatus: laptop.assignedToId ? "Assigned" : "Available",
            toStatus: "In Repair",
            reason: "Hardware malfunction reported by user",
            changedBy: "IT Support",
            changedAt: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks later
          },
        });
        console.log(`  ✓ Created repair status history`);
      }

      if (laptop.status === "Retired") {
        // Create retirement transition
        await prisma.laptopStatusHistory.create({
          data: {
            laptopId: laptop.id,
            fromStatus: "Available",
            toStatus: "Retired",
            reason: "End of lifecycle - hardware obsolete",
            changedBy: "IT Manager",
            changedAt: new Date(baseDate.getTime() + 21 * 24 * 60 * 60 * 1000), // 3 weeks later
          },
        });
        console.log(`  ✓ Created retirement status history`);
      }
    }

    // Create some additional assignment history (staff who previously had laptops)
    console.log("\nCreating additional historical assignments...");

    const availableLaptop = laptops.find((l) => l.status === "Available");
    if (availableLaptop && staff.length > 2) {
      // Simulate this laptop was previously assigned to another staff member
      const previousStaff = staff.find(
        (s) => s.id !== availableLaptop.assignedToId
      );
      if (previousStaff) {
        const assignDate = new Date(
          availableLaptop.createdAt.getTime() + 2 * 24 * 60 * 60 * 1000
        );
        const unassignDate = new Date(
          availableLaptop.createdAt.getTime() + 10 * 24 * 60 * 60 * 1000
        );

        // Previous assignment (now closed)
        await prisma.laptopAssignmentHistory.create({
          data: {
            laptopId: availableLaptop.id,
            staffId: previousStaff.id,
            assignedAt: assignDate,
            unassignedAt: unassignDate,
            assignedBy: "IT Department",
            reason: "Temporary assignment during onboarding",
            notes:
              "Short-term assignment while permanent device was being prepared",
          },
        });

        // Status changes for this assignment
        await prisma.laptopStatusHistory.create({
          data: {
            laptopId: availableLaptop.id,
            fromStatus: "Available",
            toStatus: "Assigned",
            reason: `Temporarily assigned to ${previousStaff.firstname} ${previousStaff.lastname}`,
            changedBy: "IT Department",
            changedAt: assignDate,
          },
        });

        await prisma.laptopStatusHistory.create({
          data: {
            laptopId: availableLaptop.id,
            fromStatus: "Assigned",
            toStatus: "Available",
            reason: "Returned after temporary assignment completed",
            changedBy: "IT Department",
            changedAt: unassignDate,
          },
        });

        console.log(
          `  ✓ Created historical assignment for ${previousStaff.firstname} ${previousStaff.lastname}`
        );
      }
    }

    console.log("\n✅ Realistic laptop history created successfully!");
    console.log("\nNow the History feature will show meaningful data:");
    console.log("- Status changes with reasons and timestamps");
    console.log("- Assignment history with staff details");
    console.log("- Proper audit trail for compliance");
  } catch (error) {
    console.error("Error creating history:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createRealisticHistory();
