// app/laptops/actions.ts
'use server'; // THIS IS CRUCIAL - tells Next.js these functions run on the server

import { prisma } from '@/lib/prisma'; // Import your singleton Prisma client
import { revalidatePath } from 'next/cache'; // To refresh data after changes
import { LaptopManager, LaptopStatus } from '@/lib/laptop-management';

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

export async function updateLaptop(formData: FormData) {
  const id = formData.get('id') as string;
  const make = formData.get('make') as string;
  const model = formData.get('model') as string;
  const serialNumber = formData.get('serialNumber') as string;
  const status = formData.get('status') as LaptopStatus;
  const assignedToEmail = formData.get('assignedTo') as string | null;

  if (!id || !make || !model || !serialNumber || !status) {
    return { error: 'Missing required fields.' };
  }

  try {
    // Get current laptop to check current state
    const currentLaptop = await prisma.laptop.findUnique({
      where: { id },
      include: { assignedTo: true }
    });

    if (!currentLaptop) {
      return { error: 'Laptop not found.' };
    }

    let assignedToId = null;
    
    // Handle assignment logic
    if (assignedToEmail && assignedToEmail.trim()) {
      // If status is 'Returned', don't allow assignment
      if (status === 'Returned') {
        return { error: 'Cannot assign a laptop with "Returned" status. Please set to "Available" after wiping.' };
      }

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

    // If we have a status change, use the business logic
    if (currentLaptop.status !== status) {
      try {
        await LaptopManager.updateLaptopStatus(id, status);
      } catch (validationError) {
        return { error: (validationError as Error).message };
      }
    }

    // Update the basic laptop information (make, model, serialNumber)
    // Note: assignedToId will be handled by the status logic above
    const updateData: {
      make: string;
      model: string;
      serialNumber: string;
      assignedToId?: string | null;
      status?: string;
    } = {
      make,
      model,
      serialNumber,
    };

    // Only update assignment if status allows it and we have a valid assignment
    if (assignedToId && !['Returned', 'Retired'].includes(status)) {
      updateData.assignedToId = assignedToId;
      updateData.status = 'Assigned'; // Force status to Assigned if we're assigning
    } else if (!assignedToId && ['Available', 'In Repair'].includes(status)) {
      updateData.assignedToId = null;
    }

    await prisma.laptop.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/laptops');
    return { success: true };
  } catch (e: unknown) {
    const error = e as { code?: string; message?: string };
    if (error.code === 'P2002') {
      return { error: `A laptop with serial number "${serialNumber}" already exists.` };
    }
    console.error('Error updating laptop:', e);
    return { error: 'Failed to update laptop. Please try again.' };
  }
}

export async function deleteLaptop(id: string) {
  try {
    await prisma.laptop.delete({
      where: { id },
    });
    revalidatePath('/laptops');
    return { success: true };
  } catch (e: unknown) {
    console.error('Error deleting laptop:', e);
    return { error: 'Failed to delete laptop. Please try again.' };
  }
}

export async function wipeLaptop(formData: FormData) {
  const laptopId = formData.get('laptopId') as string;
  const notes = formData.get('notes') as string;

  if (!laptopId) {
    return { error: 'Laptop ID is required.' };
  }

  try {
    // Get current laptop to verify it's in Returned status
    const laptop = await prisma.laptop.findUnique({
      where: { id: laptopId },
    });

    if (!laptop) {
      return { error: 'Laptop not found.' };
    }

    if (laptop.status !== 'Returned') {
      return { error: 'Only laptops with "Returned" status can be wiped.' };
    }

    // Use LaptopManager to update status with proper audit trail
    await LaptopManager.updateLaptopStatus(laptopId, 'Available', {
      reason: 'Laptop wiped and ready for reassignment',
      changedBy: 'System', // In a real app, you'd get this from authentication
      notes: notes || undefined
    });

    revalidatePath('/laptops');
    revalidatePath(`/laptops/${laptopId}`);
    revalidatePath('/'); // Dashboard
    
    return { success: true };
  } catch (error) {
    console.error('Failed to wipe laptop:', error);
    return { error: 'Failed to wipe laptop. Please try again.' };
  }
}

export async function completeRepair(formData: FormData) {
  const laptopId = formData.get('laptopId') as string;
  const notes = formData.get('notes') as string;

  if (!laptopId) {
    return { error: 'Laptop ID is required.' };
  }

  try {
    // Parse multiple parts from form data
    const parts: { partId: string; quantity: number }[] = [];
    const entries = Array.from(formData.entries());
    
    // Group parts data
    const partsData: { [key: string]: { partId?: string; quantity?: string } } = {};
    
    entries.forEach(([key, value]) => {
      const match = key.match(/^parts\[(\d+)\]\[(partId|quantity)\]$/);
      if (match) {
        const index = match[1];
        const field = match[2];
        if (!partsData[index]) partsData[index] = {};
        partsData[index][field as 'partId' | 'quantity'] = value as string;
      }
    });

    // Convert to array
    Object.values(partsData).forEach(partData => {
      if (partData.partId && partData.quantity) {
        const quantity = parseInt(partData.quantity, 10);
        if (quantity > 0) {
          parts.push({
            partId: partData.partId,
            quantity: quantity
          });
        }
      }
    });

    // Get current laptop to verify it's in In Repair status
    const laptop = await prisma.laptop.findUnique({
      where: { id: laptopId },
      include: { assignedTo: true }
    });

    if (!laptop) {
      return { error: 'Laptop not found.' };
    }

    if (laptop.status !== 'In Repair') {
      return { error: 'Only laptops with "In Repair" status can be marked as repaired.' };
    }

    // Determine the new status based on assignment
    const newStatus = laptop.assignedToId ? 'Assigned' : 'Available';

    // For now, we'll support single part only due to TypeScript issues
    // TODO: Fix Prisma TypeScript configuration for proper multi-part support
    if (parts.length > 0) {
      const totalPartsText = parts.map(p => `${p.quantity}x Part ID: ${p.partId}`).join(', ');
      const partNote = `Multiple parts requested: ${totalPartsText}. Only first part processed due to system limitations.`;
      
      console.warn(partNote);
      
      // Process only the first part for now
      const firstPart = parts[0];
      
      // Use raw SQL to work around TypeScript issues
      const partResult = await prisma.$queryRaw`SELECT * FROM Part WHERE id = ${firstPart.partId}` as unknown[];
      
      if (partResult.length === 0) {
        return { error: `Part not found: ${firstPart.partId}` };
      }
      
      const part = partResult[0] as { id: string; name: string; stockLevel: number };
      
      if (part.stockLevel < firstPart.quantity) {
        return { error: `Insufficient stock for part. Requested: ${firstPart.quantity}, Available: ${part.stockLevel}` };
      }

      // Update stock using raw SQL
      await prisma.$executeRaw`UPDATE Part SET stockLevel = stockLevel - ${firstPart.quantity} WHERE id = ${firstPart.partId}`;
      
      // Create stock history using raw SQL
      await prisma.$executeRaw`
        INSERT INTO PartStockHistory (id, partId, changeType, quantity, previousStock, newStock, reason, changedBy, changedAt, notes)
        VALUES (${crypto.randomUUID()}, ${firstPart.partId}, 'Used in Repair', ${-firstPart.quantity}, ${part.stockLevel}, ${part.stockLevel - firstPart.quantity}, 
                ${'Used for laptop repair: ' + laptop.make + ' ' + laptop.model + ' (' + laptop.serialNumber + ')'}, 'System', datetime('now'), ${notes || null})
      `;

      // Update laptop status using LaptopManager
      const finalNotes = `Repair completed using ${firstPart.quantity}x part. ${notes || ''}`.trim();

      await LaptopManager.updateLaptopStatus(laptopId, newStatus as LaptopStatus, {
        reason: 'Repair completed',
        changedBy: 'System',
        notes: finalNotes
      });
    } else {
      // No parts used, just update laptop status
      await LaptopManager.updateLaptopStatus(laptopId, newStatus as LaptopStatus, {
        reason: 'Repair completed',
        changedBy: 'System',
        notes: notes || undefined
      });
    }

    revalidatePath('/laptops');
    revalidatePath(`/laptops/${laptopId}`);
    revalidatePath('/'); // Dashboard
    revalidatePath('/parts'); // Parts page
    
    return { success: true, newStatus };
  } catch (error) {
    console.error('Failed to complete repair:', error);
    return { error: 'Failed to complete repair. Please try again.' };
  }
}