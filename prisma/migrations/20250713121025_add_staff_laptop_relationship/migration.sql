/*
  Warnings:

  - You are about to drop the column `assignedTo` on the `Laptop` table. All the data in the column will be lost.
  - Added the required column `email` to the `Staff` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Laptop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "assignedToId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "returnDate" DATETIME,
    CONSTRAINT "Laptop_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Laptop" ("createdAt", "id", "make", "model", "returnDate", "serialNumber", "status", "updatedAt") SELECT "createdAt", "id", "make", "model", "returnDate", "serialNumber", "status", "updatedAt" FROM "Laptop";
DROP TABLE "Laptop";
ALTER TABLE "new_Laptop" RENAME TO "Laptop";
CREATE UNIQUE INDEX "Laptop_serialNumber_key" ON "Laptop"("serialNumber");
CREATE TABLE "new_Staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "department" TEXT,
    "isteacher" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leavingDate" DATETIME
);
INSERT INTO "new_Staff" ("createdAt", "department", "firstname", "id", "isteacher", "lastname", "leavingDate", "startDate", "updatedAt") SELECT "createdAt", "department", "firstname", "id", "isteacher", "lastname", "leavingDate", "startDate", "updatedAt" FROM "Staff";
DROP TABLE "Staff";
ALTER TABLE "new_Staff" RENAME TO "Staff";
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
