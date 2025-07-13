// app/laptops/page.tsx
import { getLaptops } from './actions'; // Import your server action
import { DataTable } from '@/components/ui/data-table'; // The data table component
import { columns } from './columns'; // Your column definitions

export default async function LaptopsPage() {
  const laptops = await getLaptops(); // Data fetched directly on the server!

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-extrabold mb-8 text-center">Laptop Inventory System</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        

         {/* Placeholder for Offboarding - we'll add this later */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-3">Offboarding Laptops (Coming Soon!)</h2>
          <p className="text-gray-600">
            Track laptops from staff who are leaving the school.
          </p>
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-6 mt-8">All Laptops in Inventory</h2>
      <DataTable columns={columns} data={laptops} />
    </div>
  );
}