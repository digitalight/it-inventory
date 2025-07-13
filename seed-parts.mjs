// seed-parts.mjs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding parts data...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Storage' },
      update: {},
      create: {
        name: 'Storage',
        description: 'Hard drives, SSDs, and storage devices'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Memory' },
      update: {},
      create: {
        name: 'Memory',
        description: 'RAM modules and memory components'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Input Devices' },
      update: {},
      create: {
        name: 'Input Devices',
        description: 'Keyboards, mice, and input peripherals'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Cables & Adapters' },
      update: {},
      create: {
        name: 'Cables & Adapters',
        description: 'Power cables, USB cables, and adapters'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Display' },
      update: {},
      create: {
        name: 'Display',
        description: 'Monitors, screens, and display components'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Power & Charging' },
      update: {},
      create: {
        name: 'Power & Charging',
        description: 'Chargers, power supplies, and batteries'
      }
    })
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create parts
  const parts = [
    // Storage
    {
      name: 'Samsung 970 EVO Plus 1TB SSD',
      description: 'NVMe M.2 SSD for laptop upgrades',
      categoryId: categories[0].id,
      stockLevel: 15,
      minStockLevel: 5,
      location: 'Storage Room A-1',
      partNumber: 'MZ-V7S1T0BW'
    },
    {
      name: 'WD Blue 500GB SSD',
      description: '2.5" SATA SSD for general use',
      categoryId: categories[0].id,
      stockLevel: 8,
      minStockLevel: 10,
      location: 'Storage Room A-1',
      partNumber: 'WDS500G2B0A'
    },
    {
      name: 'Seagate 2TB HDD',
      description: '2.5" external hard drive',
      categoryId: categories[0].id,
      stockLevel: 0,
      minStockLevel: 3,
      location: 'Storage Room A-2',
      partNumber: 'STGX2000400'
    },

    // Memory
    {
      name: 'Crucial 8GB DDR4-3200',
      description: 'SODIMM memory module for laptops',
      categoryId: categories[1].id,
      stockLevel: 25,
      minStockLevel: 15,
      location: 'Memory Shelf B-1',
      partNumber: 'CT8G4SFRA32A'
    },
    {
      name: 'Kingston 16GB DDR4-2666',
      description: 'High capacity SODIMM module',
      categoryId: categories[1].id,
      stockLevel: 12,
      minStockLevel: 8,
      location: 'Memory Shelf B-1',
      partNumber: 'KVR26S19D8/16'
    },
    {
      name: 'Corsair 32GB DDR4-3200',
      description: 'Premium high-capacity memory',
      categoryId: categories[1].id,
      stockLevel: 3,
      minStockLevel: 5,
      location: 'Memory Shelf B-2',
      partNumber: 'CMSX32GX4M2A3200C22'
    },

    // Input Devices
    {
      name: 'Logitech MX Keys Mini',
      description: 'Wireless compact keyboard',
      categoryId: categories[2].id,
      stockLevel: 6,
      minStockLevel: 4,
      location: 'Peripherals C-1',
      partNumber: '920-010475'
    },
    {
      name: 'Dell USB Wired Mouse',
      description: 'Standard 3-button optical mouse',
      categoryId: categories[2].id,
      stockLevel: 20,
      minStockLevel: 15,
      location: 'Peripherals C-2',
      partNumber: 'MS116'
    },
    {
      name: 'Apple Magic Trackpad',
      description: 'Wireless trackpad for Mac compatibility',
      categoryId: categories[2].id,
      stockLevel: 2,
      minStockLevel: 3,
      location: 'Peripherals C-1',
      partNumber: 'MK2D3AM/A'
    },

    // Cables & Adapters
    {
      name: 'USB-C to USB-A Adapter',
      description: 'Convert USB-C ports to USB-A',
      categoryId: categories[3].id,
      stockLevel: 35,
      minStockLevel: 25,
      location: 'Cables Drawer D-1',
      partNumber: 'CA-USBC-A'
    },
    {
      name: 'HDMI Cable 6ft',
      description: 'Standard HDMI to HDMI cable',
      categoryId: categories[3].id,
      stockLevel: 18,
      minStockLevel: 12,
      location: 'Cables Drawer D-2',
      partNumber: 'HDMI-6FT'
    },
    {
      name: 'USB-C Hub',
      description: '7-in-1 USB-C hub with HDMI, USB-A ports',
      categoryId: categories[3].id,
      stockLevel: 0,
      minStockLevel: 8,
      location: 'Cables Drawer D-1',
      partNumber: 'HUB-7IN1'
    },

    // Display
    {
      name: 'Dell 24" Monitor',
      description: '1920x1080 IPS monitor',
      categoryId: categories[4].id,
      stockLevel: 5,
      minStockLevel: 3,
      location: 'Monitor Storage E-1',
      partNumber: 'S2421DS'
    },
    {
      name: 'LG 27" 4K Monitor',
      description: '3840x2160 USB-C monitor',
      categoryId: categories[4].id,
      stockLevel: 2,
      minStockLevel: 2,
      location: 'Monitor Storage E-1',
      partNumber: '27UP850-W'
    },

    // Power & Charging
    {
      name: 'Dell 65W USB-C Charger',
      description: 'Universal USB-C laptop charger',
      categoryId: categories[5].id,
      stockLevel: 22,
      minStockLevel: 20,
      location: 'Charger Bin F-1',
      partNumber: 'LA65NM170'
    },
    {
      name: 'Apple 61W USB-C Charger',
      description: 'MacBook Pro charger',
      categoryId: categories[5].id,
      stockLevel: 8,
      minStockLevel: 10,
      location: 'Charger Bin F-2',
      partNumber: 'MRW22LL/A'
    },
    {
      name: 'Portable Power Bank 20000mAh',
      description: 'High capacity power bank with USB-C PD',
      categoryId: categories[5].id,
      stockLevel: 0,
      minStockLevel: 5,
      location: 'Charger Bin F-3',
      partNumber: 'PB-20K-USBC'
    }
  ];

  for (const partData of parts) {
    const part = await prisma.part.create({
      data: partData
    });

    // Create initial stock history entry
    if (partData.stockLevel > 0) {
      await prisma.partStockHistory.create({
        data: {
          partId: part.id,
          changeType: 'IN',
          quantity: partData.stockLevel,
          previousStock: 0,
          newStock: partData.stockLevel,
          reason: 'Initial inventory',
          changedBy: 'System',
          notes: 'Initial stock entry during setup'
        }
      });
    }
  }

  console.log(`✅ Created ${parts.length} parts with stock history`);
  console.log('🎉 Parts seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding parts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
