-- CreateTable
CREATE TABLE "LaptopStatusHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "laptopId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "reason" TEXT,
    "changedBy" TEXT,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "LaptopStatusHistory_laptopId_fkey" FOREIGN KEY ("laptopId") REFERENCES "Laptop" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LaptopAssignmentHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "laptopId" TEXT NOT NULL,
    "staffId" TEXT,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassignedAt" DATETIME,
    "reason" TEXT,
    "assignedBy" TEXT,
    "notes" TEXT,
    CONSTRAINT "LaptopAssignmentHistory_laptopId_fkey" FOREIGN KEY ("laptopId") REFERENCES "Laptop" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LaptopAssignmentHistory_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
