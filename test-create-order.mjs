// test-create-order.mjs
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testCreateOrder() {
  console.log('Testing order creation...')

  try {
    // Create a test order
    const order = await prisma.order.create({
      data: {
        name: 'Test Order - New Laptops',
        supplierId: (await prisma.supplier.findFirst({ where: { name: 'Dell Technologies' } }))?.id || '',
        status: 'Request',
        requestedBy: 'Test User',
        deliveryCost: 25.00,
        totalAmount: 2500.00,
        notes: 'Urgent order for new student laptops'
      }
    })

    console.log('Created order:', order.id)

    // Add some order items
    await prisma.orderItem.createMany({
      data: [
        {
          orderId: order.id,
          name: 'Dell Latitude 5520',
          quantity: 10,
          unitPrice: 850.00,
          totalPrice: 8500.00,
          notes: '15.6" laptop with Intel i5, 8GB RAM, 256GB SSD'
        },
        {
          orderId: order.id,
          name: 'Dell Laptop Bag',
          quantity: 10,
          unitPrice: 35.00,
          totalPrice: 350.00,
          notes: 'Professional laptop carrying case'
        }
      ]
    })

    console.log('Added order items successfully')

    // Update total amount
    await prisma.order.update({
      where: { id: order.id },
      data: { totalAmount: (10 * 850.00) + (10 * 35.00) } // 8850.00
    })

    console.log('Order creation test completed successfully!')

  } catch (error) {
    console.error('Error creating test order:', error)
  }
}

testCreateOrder()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
