// app/laptops/page.tsx
import { getLaptops } from './actions'; // Import your server action
import { DataTable } from '@/components/ui/data-table'; // The data table component
import { columns } from './columns'; // Your column definitions
import { AddLaptopModal } from '@/components/add-laptop-modal'; // The add laptop modal

export default async function LaptopsPage() {
  const laptops = await getLaptops(); // Data fetched directly on the server!

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-extrabold mb-8 text-center">Laptop Inventory System</h1>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">All Laptops in Inventory</h2>
        <AddLaptopModal />
      </div>
      
      <DataTable columns={columns} data={laptops} />
    </div>
  );
}