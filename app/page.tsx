// app/page.tsx
import { getDashboardStats, getLeavingStaff } from './dashboard/actions';
import { DashboardCard } from '@/components/dashboard-card';
import { DataTable } from '@/components/ui/data-table';
import { leavingStaffColumns } from '@/components/leaving-staff-columns';
import { Laptop, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const [stats, leavingStaff] = await Promise.all([
    getDashboardStats(),
    getLeavingStaff()
  ]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your IT inventory system</p>
        </div>
        
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Laptops Assigned"
          value={stats.assignedLaptops}
          description="Currently assigned to staff"
          iconName="laptop"
          className="border-blue-200 bg-blue-50"
        />
        
        <DashboardCard
          title="Current Staff"
          value={stats.currentStaff}
          description="Active staff members"
          iconName="users"
          className="border-green-200 bg-green-50"
        />
        
        <DashboardCard
          title="Laptops in Repair"
          value={stats.laptopsInRepair}
          description="Currently being repaired"
          iconName="wrench"
          className="border-orange-200 bg-orange-50"
        />
        
        <DashboardCard
          title="Departing Staff Laptops"
          value={stats.laptopsWithLeavingStaff}
          description="Staff leaving in next 3 months"
          iconName="alertTriangle"
          className="border-red-200 bg-red-50"
        />
      </div>

      {/* Bottom Section - Grid with Quick Actions and Leaving Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Quick Actions and System Status */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-3">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/laptops">
                <Button variant="ghost" className="w-full justify-start">
                  <Laptop className="mr-2 h-4 w-4" />
                  View All Laptops
                </Button>
              </Link>
              <Link href="/staff">
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  View All Staff
                </Button>
              </Link>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-3">System Status</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Laptops</span>
                <span className="font-semibold">{stats.assignedLaptops + stats.laptopsInRepair + stats.returnedLaptops}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available Laptops</span>
                <span className="font-semibold text-green-600">
                  {Math.max(0, stats.assignedLaptops - stats.laptopsInRepair - stats.returnedLaptops)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Returned (Awaiting Wipe)</span>
                <span className="font-semibold text-orange-600">{stats.returnedLaptops}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">System Health</span>
                <span className="font-semibold text-green-600">Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Leaving Staff Table */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h2 className="text-2xl font-semibold">Staff Leaving Soon</h2>
            <span className="text-sm text-gray-500">Next 3 months</span>
          </div>
          {leavingStaff.length > 0 ? (
            <DataTable 
              columns={leavingStaffColumns} 
              data={leavingStaff}
              showSearch={false}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No staff are scheduled to leave in the next 3 months</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
