# IT Inventory Management System

A comprehensive inventory management system built with Next.js 15, Prisma, and SQLite for managing laptops, staff assignments, parts, and orders.

## Features

- **User Authentication**: Secure login system with role-based access control (admin/user)
- **User Management**: Admin interface to create, manage, and delete user accounts
- **Laptop Management**: Track laptops, assignments, status changes, and maintenance
- **Staff Management**: Manage staff records with laptop assignments and history
- **Parts Inventory**: Track parts stock levels with low stock alerts and order tracking
- **Order Management**: Handle supplier orders with part selection, document uploads, and status tracking
- **Part-Order Integration**: Add existing parts to orders with automatic stock updates when delivered
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

# Seed the database with user accounts and sample data
npm run seed

# OR, if you only want to create the admin user:
npm run init-admin
```

**First Login:**
After setting up the database, you can log in with:
- **Username:** admin
- **Password:** admin123

**Note:** The admin user will be automatically created on first login attempt if it doesn't exist, but it's recommended to run the seeding or init-admin command explicitly.

**Important:** Change the default password immediately after first login through the user management interface.

### 4. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Database URL for SQLite
DATABASE_URL="file:/Users/your-username/path/to/it-inventory/prisma/inventory.db"

# Basic Authentication
AUTH_USERNAME="admin"
AUTH_PASSWORD="admin123"
AUTH_SECRET="your-secret-key-change-this-in-production"
```

**Important Notes:**
- Replace `your-username/path/to` with your actual path to the project
- Change the default admin password after first login
- Generate a strong AUTH_SECRET for production use

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Authentication & User Management

### Default Admin Account

The system comes with a default admin account:
- **Username:** admin
- **Password:** admin123

### User Management Features

- **Role-based Access**: Admin and User roles with different permissions
- **Admin Functions**: 
  - Create new user accounts
  - Activate/deactivate users
  - Reset user passwords
  - Delete user accounts
  - Access all system features
- **User Functions**: 
  - Access to laptop, staff, parts, and order management
  - Cannot access user management features

### Changing Default Credentials

**Important Security Note:** Change the default admin password immediately after first login:

1. Log in with admin/admin123
2. Click "Users" in the navigation menu
3. Find the admin user and click the actions menu (⋯)
4. Select "Reset Password" and set a strong password

### Adding New Users

Admins can create new user accounts:

1. Navigate to "Users" in the admin menu
2. Click "Add User"
3. Fill in username, password, email (optional), and role
4. Click "Create User"

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Create admin and sample user accounts
- `npm run init-admin` - Create only the default admin user
- `npm run check-users` - List all users in the database
- `npx prisma studio` - Open Prisma Studio to view/edit database
- `npx prisma migrate dev` - Create and apply new database migrations

## Seeding Sample Data

The seeding process creates user accounts and sample data for testing:

```bash
# Seed users (creates admin and test accounts)
node seed-users.mjs

# Seed parts and categories
node seed-parts.mjs

# Seed suppliers
node seed-suppliers.mjs

# Or run all seeding at once
npm run seed
```

### Default User Accounts Created

After seeding, these accounts will be available:
- **admin** / admin123 (Administrator)
- **john** / password123 (User)
- **jane** / password123 (User)

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

1. **Authentication/Login Issues**
   ```bash
   # Check if admin user exists
   npm run check-users
   
   # Create admin user if missing
   npm run init-admin
   
   # Verify .env file has correct AUTH_ variables
   # Default credentials: admin/admin123
   ```

2. **"No admin user found" Error**
   ```bash
   # Create the default admin user
   npm run init-admin
   
   # Or run full seeding (creates admin + sample users)
   npm run seed
   ```

3. **Database connection errors**

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
DATABASE_URL="file:/path/to/production/inventory.db"
AUTH_USERNAME="your-admin-username"
AUTH_PASSWORD="strong-admin-password"
AUTH_SECRET="very-strong-random-secret-minimum-32-characters"
```

**Security Recommendations for Production:**
- Use a strong, unique admin password
- Generate a cryptographically secure AUTH_SECRET (minimum 32 characters)
- Consider setting up additional admin users and disabling the default account
- Regularly rotate passwords and secrets

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
