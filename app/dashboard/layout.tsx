import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Layout from "@/components/layout/dashboard-layout";
import { User } from "@prisma/client";
import { getCompanies } from "@/actions/company/get";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const companies = await getCompanies(session?.user.id ?? "");

  if (companies.length === 0) {
    redirect("/setup");
  }

  return (
    <Layout user={session.user as User}>
      {children}
    </Layout>
  );
};

export default DashboardLayout;
