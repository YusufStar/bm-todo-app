import InvitationsTable from "@/components/invitations/invitations-table";
import DashboardPageLayout from "@/components/layout/dashboard-page-layout";

export default function InvitationsPage() {
  return (
    <DashboardPageLayout
      title="Invitations"
      subtitle="Manage your company invitations and pending requests."
    >
      <InvitationsTable />
    </DashboardPageLayout>
  );
} 