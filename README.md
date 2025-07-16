# IT Inventory Management System

A simple, modern web application for managing IT equipment, staff, and inventory. Built with Next.js and ready to use out of the box.

## 🚀 Quick Start (5 minutes)

### 1. Install Requirements
You need Node.js installed on your computer. [Download it here](https://nodejs.org/) (choose the LTS version).

### 2. Get the Code
Download this project and open it in your terminal/command prompt.

### 3. Install & Setup
```bash
# Install everything needed
npm install

# Set up the database
npx prisma generate
npx prisma migrate dev --name init

# Create the admin user
npm run init-admin
```

### 4. Start the Application
```bash
npm run dev
```

Open your browser and go to: **http://localhost:3000**

### 5. Login
- **Username:** `admin`
- **Password:** `admin123`

**⚠️ Important:** Change this password immediately after logging in!

## 📋 What This System Does

- **👥 User Management** - Add/remove users with different permission levels
- **💻 Laptop Tracking** - Track all laptops, who has them, and their status
- **🏢 Staff Management** - Manage staff records and laptop assignments
- **🔧 Parts Inventory** - Track spare parts and stock levels
- **📦 Order Management** - Handle orders from suppliers with document uploads
- **📊 Dashboard** - Overview of everything at a glance

## 🎯 First Steps After Login

1. **Change Admin Password**
   - Click "Users" in the top menu
   - Find "admin" user → click the ⋯ menu → "Reset Password"

2. **Add Your Team**
   - Go to "Users" → "Add User"
   - Create accounts for your team members

3. **Import Your Data**
   - Use the import features in Laptops and Staff sections
   - Or add items manually through the interface

## 🛠 Common Commands

```bash
# Start the application
npm run dev

# Create admin user (if needed)
npm run init-admin

# Check who's in the system
npm run check-users

# View/edit database directly
npx prisma studio
```

## 🆘 Having Problems?

### "Can't login" or "No admin user"
```bash
npm run init-admin
```

### "Database error" or something's broken
```bash
npx prisma generate
npx prisma migrate dev
npm run init-admin
```

### Need to start over completely?
```bash
rm prisma/inventory.db
npx prisma migrate dev --name init
npm run init-admin
```

## 📁 How It's Organized

Your data is stored in:
- **Database:** `prisma/inventory.db` (back this up!)
- **Uploaded Files:** `uploads/` folder
- **Configuration:** `.env` file

## 🔒 Security Notes

- Change the default admin password immediately
- The system stores passwords securely (encrypted)
- Only admins can manage users
- All actions are logged for audit trails

## 🚀 Ready for Production?

See `PRODUCTION_READY.md` for deployment instructions and security recommendations.

---

**Need Help?** Check the troubleshooting section above or review the detailed documentation in the original README sections below.

---

## 📖 Detailed Documentation

<details>
<summary>Click to expand full documentation</summary>

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

### Adding New Users

Admins can create new user accounts:

1. Navigate to "Users" in the admin menu
2. Click "Add User"
3. Fill in username, password, email (optional), and role
4. Click "Create User"

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run init-admin` - Create only the default admin user
- `npm run check-users` - List all users in the database
- `npx prisma studio` - Open Prisma Studio to view/edit database
- `npx prisma migrate dev` - Create and apply new database migrations

### Key Features Walkthrough

**Dashboard**
- Overview of system statistics
- Quick access to all modules
- Recent activity summary

**Laptop Management**
- Add, edit, and track laptops
- Assign laptops to staff members
- Track status changes (Available, Assigned, In Repair, etc.)
- Complete audit trail of assignments and status changes
- Bulk import from CSV

**Staff Management**
- Manage staff records
- Track laptop assignments per staff member
- Handle leaving staff workflow
- Bulk import from CSV

**Parts Inventory**
- Categorized parts management
- Stock level tracking with low stock alerts
- Stock adjustment history
- Parts movement tracking

**Order Management**
- Create and manage supplier orders
- Upload order documents (quotes, invoices, receipts)
- Track order status (Request → Quotes → Ordered → Delivered)
- Automatic status updates based on document uploads
- Supplier management

### Database Management

**Viewing Data**
```bash
npx prisma studio  # Web interface to view/edit data
```

**Backup Database**
```bash
cp prisma/inventory.db prisma/backup-$(date +%Y%m%d).db
```

### File Uploads

The system supports file uploads for order documents:
- Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG
- Files are stored in `uploads/orders/` directory
- File information is tracked in the database

### Technology Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: SQLite with Prisma ORM
- **File Storage**: Local filesystem
- **Tables**: TanStack Table (React Table)
- **Forms**: React Hook Form with validation
- **Notifications**: Sonner toast notifications

</details>
