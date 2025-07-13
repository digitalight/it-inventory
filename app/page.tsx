// app/page.tsx
import { getDashboardStats, getLeavingStaff, getLaptopsInRepair, getLaptopsForWiping } from './dashboard/actions';
import { DashboardCard } from '@/components/dashboard-card';
import { DataTable } from '@/components/ui/data-table';
import { leavingStaffColumns } from '@/components/leaving-staff-columns';
import { LaptopList } from '@/components/laptop-list';
import { Users, Wrench, RotateCcw } from 'lucide-react';

export default async function DashboardPage() {
  const [stats, leavingStaff, laptopsInRepair, laptopsForWiping] = await Promise.all([
    getDashboardStats(),
    getLeavingStaff(),
    getLaptopsInRepair(),
    getLaptopsForWiping()
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <DashboardCard
          title="Laptops Assigned"
          value={stats.assignedLaptops}
          description="Currently assigned to staff"
          iconName="laptop"
          className="border-blue-200 bg-blue-50"
        />
        
        <DashboardCard
          title="Laptops Available"
          value={stats.availableLaptops}
          description="Ready for assignment"
          iconName="laptop"
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
          title="Return Laptops"
          value={stats.laptopsWithLeavingStaff}
          description="Staff leaving in next 3 months"
          iconName="alertTriangle"
          className="border-red-200 bg-red-50"
        />
        
        <DashboardCard
          title="Total Parts"
          value={stats.totalParts}
          description="Parts in inventory"
          iconName="package"
          className="border-purple-200 bg-purple-50"
        />
        
        <DashboardCard
          title="Out of Stock"
          value={stats.outOfStockCount}
          description="Need immediate restocking"
          iconName="alertTriangle"
          className="border-red-200 bg-red-50"
        />
      </div>

      {/* Bottom Section - Grid with Staff Leaving (2/3) and Repair/Wiping (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff Leaving Soon - Takes 2/3 width */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border">
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h2 className="text-xl font-semibold">Staff Leaving Soon</h2>
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

        {/* Right Column - Repair and Wiping Cards (1/3 width) */}
        <div className="space-y-6">
          {/* In for Repair */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Wrench className="h-5 w-5 text-orange-500" />
                In for Repair
              </h2>
              <span className="text-sm text-gray-500">{laptopsInRepair.length}</span>
            </div>
            <LaptopList 
              laptops={laptopsInRepair}
              emptyMessage="No laptops currently in repair"
            />
          </div>

          {/* For Wiping */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-blue-500" />
                For Wiping
              </h2>
              <span className="text-sm text-gray-500">{laptopsForWiping.length}</span>
            </div>
            <LaptopList 
              laptops={laptopsForWiping}
              emptyMessage="No laptops awaiting wiping"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
