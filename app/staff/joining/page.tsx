// app/staff/joining/page.tsx
import { getJoiningStaffList } from '../actions'; // Import your server action
import { DataTable } from '@/components/ui/data-table'; // The data table component
import { columns } from '../columns'; // Your column definitions
import { AddStaffModal } from '@/components/add-staff-modal'; // The add staff modal
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function JoiningStaffPage() {
  const staff = await getJoiningStaffList(); // Data fetched directly on the server!

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/staff">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Staff
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-extrabold">Joining Staff</h1>
          <p className="text-gray-600 mt-2">Staff members with start dates in the future</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Staff Joining Soon</h2>
        <AddStaffModal />
      </div>
      
      <DataTable columns={columns} data={staff} />
    </div>
  );
}
