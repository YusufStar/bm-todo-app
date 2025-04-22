-- Add EXPIRED to InvitationStatus enum
ALTER TYPE "InvitationStatus" ADD VALUE 'EXPIRED';

-- Add expiresAt and expiredAt fields to CompanyInvitation table
ALTER TABLE "CompanyInvitation" ADD COLUMN "expiresAt" TIMESTAMP(3);
ALTER TABLE "CompanyInvitation" ADD COLUMN "expiredAt" TIMESTAMP(3); 