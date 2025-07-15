# IT Inventory Management System

A comprehensive inventory management system built with Next.js 15, Prisma, and SQLite for managing laptops, staff assignments, parts, and orders.

## Features

- **Laptop Management**: Track laptops, assignments, status changes, and maintenance
- **Staff Management**: Manage staff records with laptop assignments and history
- **Parts Inventory**: Track parts stock levels with low stock alerts
- **Order Management**: Handle supplier orders with document uploads and status tracking
- **Audit Trails**: Complete history tracking for all changes
- **File Management**: Upload and manage order documents (quotes, invoices, receipts)

## Prerequisites

Before setting up this project, make sure you have the following installed:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning) - [Download here](https://git-scm.com/)

## Quick Setup Instructions

Follow these steps to get the application running on your local machine:

### 1. Clone or Download the Project

```bash
# If using Git
git clone <repository-url>
cd it-inventory

# Or download the ZIP file and extract it
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up the Database

The project uses SQLite with Prisma ORM. Set up the database:

```bash
# Generate Prisma client
npx prisma generate

# Create and migrate the database
npx prisma migrate dev --name init

# (Optional) Seed the database with sample data
npm run seed
```

### 4. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="file:./prisma/inventory.db"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio to view/edit database
- `npx prisma migrate dev` - Create and apply new database migrations

## Seeding Sample Data (Optional)

To populate the database with sample data for testing:

```bash
# Seed parts and categories
node seed-parts.mjs

# Seed suppliers
node seed-suppliers.mjs

# Import sample laptops (if you have a CSV file)
# Use the Import feature in the web interface
# CSV format: make,model,devicename,serialnumber,status,assignedtoemail
# Example: Apple,MacBook Pro,Teacher's MacBook,ABC123456,Available,

# Import sample staff (if you have a CSV file)
# Use the Import feature in the web interface
```

## Project Structure

```
├── app/                    # Next.js 15 App Router
│   ├── dashboard/         # Dashboard page
│   ├── laptops/          # Laptop management
│   ├── staff/            # Staff management
│   ├── parts/            # Parts inventory
│   ├── orders/           # Order management
│   └── api/              # API routes
├── components/           # Reusable UI components
├── lib/                 # Utility functions and configurations
├── prisma/              # Database schema and migrations
│   ├── schema.prisma    # Database schema
│   └── inventory.db     # SQLite database (created after setup)
├── public/              # Static files and sample templates
└── uploads/             # File uploads (created automatically)
```

## Key Features Walkthrough

### Dashboard
- Overview of system statistics
- Quick access to all modules
- Recent activity summary

### Laptop Management
- Add, edit, and track laptops
- Assign laptops to staff members
- Track status changes (Available, Assigned, In Repair, etc.)
- Complete audit trail of assignments and status changes
- Bulk import from CSV

### Staff Management
- Manage staff records
- Track laptop assignments per staff member
- Handle leaving staff workflow
- Bulk import from CSV

### Parts Inventory
- Categorized parts management
- Stock level tracking with low stock alerts
- Stock adjustment history
- Parts movement tracking

### Order Management
- Create and manage supplier orders
- Upload order documents (quotes, invoices, receipts)
- Track order status (Request → Quotes → Ordered → Delivered)
- Automatic status updates based on document uploads
- Supplier management

## Database Management

### Viewing Data
```bash
# Open Prisma Studio - web interface to view/edit data
npx prisma studio
```

### Database Migrations
```bash
# After making schema changes
npx prisma migrate dev --name "description-of-changes"

# Reset database (⚠️ This deletes all data)
npx prisma migrate reset
```

### Backup Database
```bash
# SQLite database is a single file, backup by copying:
cp prisma/inventory.db prisma/backup-$(date +%Y%m%d).db
```

## File Uploads

The system supports file uploads for order documents:
- Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG
- Files are stored in `uploads/orders/` directory
- File information is tracked in the database

## Troubleshooting

### Common Issues

1. **Database connection errors**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

2. **Missing dependencies**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Port already in use**
   ```bash
   # Use a different port
   npm run dev -- -p 3001
   ```

4. **File upload issues**
   - Ensure `uploads/` directory has write permissions
   - Check available disk space

### Reset Everything
If you need to start fresh:
```bash
# Remove database and start over
rm prisma/inventory.db
npx prisma migrate dev --name init
```

## Production Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Environment Variables for Production
Update your `.env` file with production values:
```bash
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="your-production-domain"
NEXTAUTH_SECRET="strong-random-secret"
```

## Technology Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: SQLite with Prisma ORM
- **File Storage**: Local filesystem
- **Tables**: TanStack Table (React Table)
- **Forms**: React Hook Form with validation
- **Notifications**: Sonner toast notifications

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Verify the database setup completed successfully
4. Check the browser console for any JavaScript errors

## License

This project is private and proprietary.
