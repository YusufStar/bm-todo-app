import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Layout from "@/components/layout/dashboard-layout";
import { User } from "@prisma/client";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <Layout user={session.user as User}>
      {children}
    </Layout>
  );
};

export default DashboardLayout;
