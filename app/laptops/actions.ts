// app/laptops/actions.ts
'use server'; // THIS IS CRUCIAL - tells Next.js these functions run on the server

import { prisma } from '@/lib/prisma'; // Import your singleton Prisma client
import { revalidatePath } from 'next/cache'; // To refresh data after changes

export async function getLaptops() {
    try {
        const laptops = await prisma.laptop.findMany({
        orderBy: {
        createdAt: 'desc', // Show newest laptops first
        },
    });
    return laptops;
    } catch (error) {
    console.error("Failed to fetch laptops:", error);
    return []; // Return empty array on error
    }
}

export async function addLaptop(formData: FormData) {
  const make = formData.get('make') as string;
  const model = formData.get('model') as string;
  const serialNumber = formData.get('serialNumber') as string;
  const status = formData.get('status') as string;
  const assignedTo = formData.get('assignedTo') as string | null;

  if (!make || !model || !serialNumber || !status) {
    return { error: 'Missing required fields.' };
  }

  try {
    await prisma.laptop.create({
      data: {
        make,
        model,
        serialNumber,
        status,
        assignedTo: assignedTo || null,
      },
    });
    revalidatePath('/laptops'); // Tell Next.js to refresh the /laptops page's data
    return { success: true };
  } catch (e: unknown) {
    const error = e as { code?: string; message?: string };
    if (error.code === 'P2002') { // Prisma error code for unique constraint violation
      return { error: `A laptop with serial number "${serialNumber}" already exists.` };
    }
    console.error('Error adding laptop:', e);
    return { error: 'Failed to add laptop. Please try again.' };
  }
}