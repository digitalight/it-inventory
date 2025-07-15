// app/staff/page.tsx
import { getStaff } from './actions'; // Import your server action
import { DataTable } from '@/components/ui/data-table'; // The data table component
import { columns } from './columns'; // Your column definitions
import { AddStaffModal } from '@/components/add-staff-modal'; // The add staff modal
import { Button } from '@/components/ui/button';
import { UserPlus, Users, UserMinus } from 'lucide-react';
import Link from 'next/link';

export default async function StaffPage() {
  const staff = await getStaff(); // Data fetched directly on the server!

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-extrabold mb-8 text-center">Staff Management System</h1>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Current Staff</h3>
          <p className="text-gray-600 text-sm mb-4">Active staff members currently working</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-600">{staff.length}</span>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <Link href="/staff/joining">
          <div className="bg-white p-6 rounded-lg shadow-md border border-green-200 hover:bg-green-50 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Joining Soon</h3>
            <p className="text-gray-600 text-sm mb-4">Staff with future start dates</p>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" className="border-green-300 text-green-700">
                View Joining
              </Button>
              <UserPlus className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </Link>
        
        <Link href="/staff/leavers">
          <div className="bg-white p-6 rounded-lg shadow-md border border-red-200 hover:bg-red-50 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Former Staff</h3>
            <p className="text-gray-600 text-sm mb-4">Staff who have already left</p>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" className="border-red-300 text-red-700">
                View Leavers
              </Button>
              <UserMinus className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Current Staff Members</h2>
        <AddStaffModal />
      </div>
      
      <DataTable columns={columns} data={staff} />
    </div>
  );
}
