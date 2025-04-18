/*
  Warnings:

  - You are about to drop the column `receiverId` on the `CompanyInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `CompanyInvitation` table. All the data in the column will be lost.
  - Added the required column `senderEmail` to the `CompanyInvitation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CompanyInvitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "invitedEmail" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "acceptedAt" DATETIME,
    "rejectedAt" DATETIME,
    "cancelledAt" DATETIME,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CompanyInvitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CompanyInvitation" ("acceptedAt", "cancelledAt", "companyId", "createdAt", "id", "invitedEmail", "message", "rejectedAt", "role", "status", "updatedAt") SELECT "acceptedAt", "cancelledAt", "companyId", "createdAt", "id", "invitedEmail", "message", "rejectedAt", "role", "status", "updatedAt" FROM "CompanyInvitation";
DROP TABLE "CompanyInvitation";
ALTER TABLE "new_CompanyInvitation" RENAME TO "CompanyInvitation";
CREATE INDEX "CompanyInvitation_companyId_idx" ON "CompanyInvitation"("companyId");
CREATE INDEX "CompanyInvitation_invitedEmail_idx" ON "CompanyInvitation"("invitedEmail");
CREATE INDEX "CompanyInvitation_status_idx" ON "CompanyInvitation"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
