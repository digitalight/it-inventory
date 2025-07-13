import { PrismaClient } from "@prisma/client";

async function assignLaptopToLeavingStaff() {
  try {
    const prisma = new PrismaClient();

    // Find the leaving staff member
    const leavingStaff = await prisma.staff.findFirst({
      where: {
        leavingDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!leavingStaff) {
      console.log("No leaving staff found");
      return;
    }

    // Find an available laptop to assign
    const availableLaptop = await prisma.laptop.findFirst({
      where: {
        status: "Available",
        assignedToId: null,
      },
    });

    if (!availableLaptop) {
      console.log("No available laptops found");
      return;
    }

    // Assign the laptop to the leaving staff
    await prisma.laptop.update({
      where: { id: availableLaptop.id },
      data: {
        status: "Assigned",
        assignedToId: leavingStaff.id,
      },
    });

    // Create assignment history
    await prisma.laptopAssignmentHistory.create({
      data: {
        laptopId: availableLaptop.id,
        staffId: leavingStaff.id,
        assignedAt: new Date(),
        assignedBy: "Test Setup",
        reason: "Assignment for testing return functionality",
      },
    });

    // Create status history
    await prisma.laptopStatusHistory.create({
      data: {
        laptopId: availableLaptop.id,
        fromStatus: "Available",
        toStatus: "Assigned",
        reason: `Assigned to ${leavingStaff.firstname} ${leavingStaff.lastname} for testing`,
        changedBy: "Test Setup",
      },
    });

    console.log(
      `✅ Assigned ${availableLaptop.make} ${availableLaptop.model} to ${leavingStaff.firstname} ${leavingStaff.lastname}`
    );
    console.log(`Now we can test the return functionality!`);

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

assignLaptopToLeavingStaff();
