// app/staff/page.tsx
import { getStaff } from './actions'; // Import your server action
import { DataTable } from '@/components/ui/data-table'; // The data table component
import { columns } from './columns'; // Your column definitions
import { AddStaffModal } from '@/components/add-staff-modal'; // The add staff modal

export default async function StaffPage() {
  const staff = await getStaff(); // Data fetched directly on the server!

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-extrabold mb-8 text-center">Staff Management System</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Placeholder for Reports */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-3">Staff Reports (Coming Soon!)</h2>
          <p className="text-gray-600">
            Generate reports on staff assignments, departures, and department breakdowns.
          </p>
        </div>

         {/* Placeholder for Notifications */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-3">Departure Alerts (Coming Soon!)</h2>
          <p className="text-gray-600">
            Get notified about staff members who are leaving soon.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">All Staff Members</h2>
        <AddStaffModal />
      </div>
      
      <DataTable columns={columns} data={staff} />
    </div>
  );
}
