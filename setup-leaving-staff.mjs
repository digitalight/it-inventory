import { PrismaClient } from "@prisma/client";

async function ensureLeavingStaffWithLaptops() {
  try {
    const prisma = new PrismaClient();

    // Check if we have any leaving staff
    const leavingStaff = await prisma.staff.findMany({
      where: {
        leavingDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Next 3 months
        },
      },
      include: {
        laptops: true,
      },
    });

    console.log("Current leaving staff with laptops:", leavingStaff.length);

    if (leavingStaff.length === 0) {
      // Find a staff member with a laptop and set them as leaving
      const staffWithLaptop = await prisma.staff.findFirst({
        where: {
          laptops: {
            some: {},
          },
          leavingDate: null,
        },
        include: {
          laptops: true,
        },
      });

      if (staffWithLaptop) {
        // Set them to leave in 2 weeks
        const leavingDate = new Date();
        leavingDate.setDate(leavingDate.getDate() + 14);

        await prisma.staff.update({
          where: { id: staffWithLaptop.id },
          data: { leavingDate },
        });

        console.log(
          `Set ${staffWithLaptop.firstname} ${
            staffWithLaptop.lastname
          } to leave on ${leavingDate.toLocaleDateString()}`
        );
        console.log(
          `They have ${staffWithLaptop.laptops.length} laptop(s) assigned`
        );
      } else {
        console.log("No staff members with laptops found to set as leaving");
      }
    } else {
      leavingStaff.forEach((staff) => {
        console.log(
          `${staff.firstname} ${
            staff.lastname
          } leaving on ${staff.leavingDate?.toLocaleDateString()} with ${
            staff.laptops.length
          } laptop(s)`
        );
      });
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

ensureLeavingStaffWithLaptops();
