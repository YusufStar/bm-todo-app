import MembersTable from "@/components/members/members-table";
import { UserInvitations } from "@/components/invitations/user-invitations";
import DashboardPageLayout from "@/components/layout/dashboard-page-layout";

export default function MembersPage() {
  return (
    <DashboardPageLayout
      title="Company Members"
      subtitle="Manage your company members and their roles."
    >
      <MembersTable />
    </DashboardPageLayout>
  );
} 