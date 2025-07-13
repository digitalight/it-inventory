// app/laptops/actions.ts
'use server'; // THIS IS CRUCIAL - tells Next.js these functions run on the server

import { prisma } from '@/lib/prisma'; // Import your singleton Prisma client
import { revalidatePath } from 'next/cache'; // To refresh data after changes

export async function getLaptops() {
    try {
        const laptops = await prisma.laptop.findMany({
            include: {
                assignedTo: true, // Include the related staff member
            },
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
  const assignedToEmail = formData.get('assignedTo') as string | null;

  if (!make || !model || !serialNumber || !status) {
    return { error: 'Missing required fields.' };
  }

  try {
    let assignedToId = null;
    
    // If email is provided, find or create the staff member
    if (assignedToEmail && assignedToEmail.trim()) {
      const existingStaff = await prisma.staff.findUnique({
        where: { email: assignedToEmail.trim() }
      });
      
      if (existingStaff) {
        assignedToId = existingStaff.id;
      } else {
        // Create basic staff record with email only
        const newStaff = await prisma.staff.create({
          data: {
            email: assignedToEmail.trim(),
            firstname: 'Unknown',
            lastname: 'Staff',
            isteacher: false,
          }
        });
        assignedToId = newStaff.id;
      }
    }

    await prisma.laptop.create({
      data: {
        make,
        model,
        serialNumber,
        status,
        assignedToId,
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

export async function importLaptopsFromCSV(formData: FormData) {
  const file = formData.get('csvFile') as File;
  
  if (!file) {
    return { error: 'No file selected.' };
  }

  if (!file.name.endsWith('.csv')) {
    return { error: 'Please select a CSV file.' };
  }

  try {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return { error: 'CSV file must contain a header row and at least one data row.' };
    }

    // Parse header row (case-insensitive)
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['make', 'model', 'serialnumber', 'status'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return { error: `Missing required columns: ${missingHeaders.join(', ')}. Required: make, model, serialnumber, status` };
    }

    // Get column indices
    const makeIndex = headers.indexOf('make');
    const modelIndex = headers.indexOf('model');
    const serialNumberIndex = headers.indexOf('serialnumber');
    const statusIndex = headers.indexOf('status');
    const assignedToEmailIndex = headers.indexOf('assignedtoemail'); // Changed to email

    let imported = 0;
    let updated = 0;
    const errors: string[] = [];

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.trim());
      
      if (row.length < requiredHeaders.length) {
        errors.push(`Row ${i + 1}: Insufficient columns`);
        continue;
      }

      const make = row[makeIndex];
      const model = row[modelIndex];
      const serialNumber = row[serialNumberIndex];
      const status = row[statusIndex];
      const assignedToEmail = assignedToEmailIndex >= 0 ? row[assignedToEmailIndex] || null : null;

      if (!make || !model || !serialNumber || !status) {
        errors.push(`Row ${i + 1}: Missing required fields`);
        continue;
      }

      // Handle staff assignment
      let assignedToId = null;
      if (assignedToEmail && assignedToEmail.trim()) {
        const existingStaff = await prisma.staff.findUnique({
          where: { email: assignedToEmail.trim() }
        });
        
        if (existingStaff) {
          assignedToId = existingStaff.id;
        } else {
          // Create basic staff record with email only
          try {
            const newStaff = await prisma.staff.create({
              data: {
                email: assignedToEmail.trim(),
                firstname: 'Unknown',
                lastname: 'Staff',
                isteacher: false,
              }
            });
            assignedToId = newStaff.id;
          } catch {
            errors.push(`Row ${i + 1}: Failed to create staff for email ${assignedToEmail}`);
            continue;
          }
        }
      }

      // Check if laptop already exists
      const existingLaptop = await prisma.laptop.findUnique({
        where: { serialNumber }
      });

      try {
        if (existingLaptop) {
          // Update existing laptop
          await prisma.laptop.update({
            where: { serialNumber },
            data: {
              make,
              model,
              status,
              assignedToId,
            }
          });
          updated++;
        } else {
          // Create new laptop
          await prisma.laptop.create({
            data: {
              make,
              model,
              serialNumber,
              status,
              assignedToId,
            }
          });
          imported++;
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    revalidatePath('/laptops');
    
    let message = `Import completed: ${imported} new laptops added, ${updated} laptops updated`;
    if (errors.length > 0) {
      message += `. ${errors.length} errors: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}`;
    }

    return { success: true, message, imported, updated, errors };
  } catch (error) {
    console.error('CSV import error:', error);
    return { error: 'Failed to process CSV file. Please check the file format.' };
  }
}