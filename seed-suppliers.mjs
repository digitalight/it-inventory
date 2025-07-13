// seed-suppliers.mjs
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding suppliers...')

  const suppliers = await prisma.supplier.createMany({
    data: [
      {
        name: 'Dell Technologies',
        contactName: 'Sarah Johnson',
        email: 'sarah.johnson@dell.com',
        phone: '+44 20 7946 0958',
        address: 'Dell House, The Boulevard, Cain Road, Bracknell, RG12 1LF, UK'
      },
      {
        name: 'HP Inc.',
        contactName: 'Michael Chen',
        email: 'michael.chen@hp.com',
        phone: '+44 118 927 4000',
        address: 'Cain Road, Bracknell, Berkshire, RG12 1HN, UK'
      },
      {
        name: 'Lenovo',
        contactName: 'Emma Thompson',
        email: 'emma.thompson@lenovo.com',
        phone: '+44 1628 593 000',
        address: 'Lenovo, 240 Blackfriars Road, London, SE1 8NW, UK'
      },
      {
        name: 'Apple Education',
        contactName: 'James Wilson',
        email: 'education@apple.com',
        phone: '+44 20 7949 7000',
        address: '1 Apple Park Way, Cupertino, CA 95014, USA'
      },
      {
        name: 'Microsoft Surface',
        contactName: 'Lisa Rodriguez',
        email: 'lisa.rodriguez@microsoft.com',
        phone: '+44 344 800 2400',
        address: 'Microsoft Campus, Thames Valley Park, Reading, RG6 1WG, UK'
      }
    ]
  })

  console.log(`Created ${suppliers.count} suppliers`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
