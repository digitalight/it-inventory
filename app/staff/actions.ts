// app/staff/actions.ts
'use server'; // THIS IS CRUCIAL - tells Next.js these functions run on the server

import { prisma } from '@/lib/prisma'; // Import your singleton Prisma client
import { revalidatePath } from 'next/cache'; // To refresh data after changes

export async function getStaff() {
    try {
        const staff = await prisma.staff.findMany({
            include: {
                laptops: true, // Include assigned laptops
            },
            orderBy: {
                createdAt: 'desc', // Show newest staff first
            },
        });
        return staff;
    } catch (error) {
        console.error("Failed to fetch staff:", error);
        return []; // Return empty array on error
    }
}

export async function addStaff(formData: FormData) {
    const email = formData.get('email') as string;
    const firstname = formData.get('firstname') as string;
    const lastname = formData.get('lastname') as string;
    const department = formData.get('department') as string;
    const isteacher = formData.get('isteacher') === 'true';
    const startDate = formData.get('startDate') as string;
    const leavingDate = formData.get('leavingDate') as string;

    if (!email || !firstname || !lastname) {
        return { error: 'Email, first name and last name are required.' };
    }

    try {
        await prisma.staff.create({
            data: {
                email,
                firstname,
                lastname,
                department: department || null,
                isteacher,
                startDate: startDate ? new Date(startDate) : new Date(),
                leavingDate: leavingDate ? new Date(leavingDate) : null,
            },
        });
        revalidatePath('/staff'); // Tell Next.js to refresh the /staff page's data
        return { success: true };
    } catch (e: unknown) {
        const error = e as { code?: string; message?: string };
        if (error.code === 'P2002') { // Prisma error code for unique constraint violation
            return { error: `A staff member with email "${email}" already exists.` };
        }
        console.error('Error adding staff:', e);
        return { error: 'Failed to add staff member. Please try again.' };
    }
}

export async function importStaffFromCSV(formData: FormData) {
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
        const requiredHeaders = ['email', 'firstname', 'lastname'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
            return { error: `Missing required columns: ${missingHeaders.join(', ')}. Required: email, firstname, lastname` };
        }

        // Get column indices
        const emailIndex = headers.indexOf('email');
        const firstnameIndex = headers.indexOf('firstname');
        const lastnameIndex = headers.indexOf('lastname');
        const departmentIndex = headers.indexOf('department');
        const isteacherIndex = headers.indexOf('isteacher');
        const startDateIndex = headers.indexOf('startdate');
        const leavingDateIndex = headers.indexOf('leavingdate');

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

            const email = row[emailIndex];
            const firstname = row[firstnameIndex];
            const lastname = row[lastnameIndex];
            const department = departmentIndex >= 0 ? row[departmentIndex] || null : null;
            const isteacher = isteacherIndex >= 0 ? row[isteacherIndex]?.toLowerCase() === 'true' : false;
            const startDate = startDateIndex >= 0 && row[startDateIndex] ? new Date(row[startDateIndex]) : new Date();
            const leavingDate = leavingDateIndex >= 0 && row[leavingDateIndex] ? new Date(row[leavingDateIndex]) : null;

            if (!email || !firstname || !lastname) {
                errors.push(`Row ${i + 1}: Missing required fields (email, firstname, lastname)`);
                continue;
            }

            // Check if staff member already exists (by email)
            const existingStaff = await prisma.staff.findFirst({
                where: { 
                    email
                }
            });

            try {
                if (existingStaff) {
                    // Update existing staff member
                    await prisma.staff.update({
                        where: { id: existingStaff.id },
                        data: {
                            department,
                            isteacher,
                            startDate,
                            leavingDate,
                        }
                    });
                    updated++;
                } else {
                    // Create new staff member
                    await prisma.staff.create({
                        data: {
                            email,
                            firstname,
                            lastname,
                            department,
                            isteacher,
                            startDate,
                            leavingDate,
                        }
                    });
                    imported++;
                }
            } catch (error) {
                errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        revalidatePath('/staff');
        
        let message = `Import completed: ${imported} new staff members added, ${updated} staff members updated`;
        if (errors.length > 0) {
            message += `. ${errors.length} errors: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}`;
        }

        return { success: true, message, imported, updated, errors };
    } catch (error) {
        console.error('CSV import error:', error);
        return { error: 'Failed to process CSV file. Please check the file format.' };
    }
}

export async function updateStaff(formData: FormData) {
    const id = formData.get('id') as string;
    const email = formData.get('email') as string;
    const firstname = formData.get('firstname') as string;
    const lastname = formData.get('lastname') as string;
    const department = formData.get('department') as string;
    const isteacher = formData.get('isteacher') === 'true';
    const startDate = formData.get('startDate') as string;
    const leavingDate = formData.get('leavingDate') as string;

    if (!id || !email || !firstname || !lastname) {
        return { error: 'ID, email, first name and last name are required.' };
    }

    try {
        await prisma.staff.update({
            where: { id },
            data: {
                email,
                firstname,
                lastname,
                department: department || null,
                isteacher,
                startDate: startDate ? new Date(startDate) : new Date(),
                leavingDate: leavingDate ? new Date(leavingDate) : null,
            },
        });
        revalidatePath('/staff');
        return { success: true };
    } catch (e: unknown) {
        const error = e as { code?: string; message?: string };
        if (error.code === 'P2002') {
            return { error: `A staff member with email "${email}" already exists.` };
        }
        console.error('Error updating staff:', e);
        return { error: 'Failed to update staff. Please try again.' };
    }
}

export async function deleteStaff(id: string) {
    try {
        // Check if staff has assigned laptops
        const staffWithLaptops = await prisma.staff.findUnique({
            where: { id },
            include: { laptops: true }
        });

        if (staffWithLaptops?.laptops && staffWithLaptops.laptops.length > 0) {
            return { error: 'Cannot delete staff member with assigned laptops. Please reassign or remove laptops first.' };
        }

        await prisma.staff.delete({
            where: { id },
        });
        revalidatePath('/staff');
        return { success: true };
    } catch (e: unknown) {
        console.error('Error deleting staff:', e);
        return { error: 'Failed to delete staff. Please try again.' };
    }
}
