-- CreateTable
CREATE TABLE "Laptop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "assignedTo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "returnDate" DATETIME
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "department" TEXT,
    "isteacher" BOOLEAN NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Laptop_serialNumber_key" ON "Laptop"("serialNumber");
