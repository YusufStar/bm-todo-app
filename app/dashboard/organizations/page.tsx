import { getCompaniesAction } from "@/actions/company/actions";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import OrganizationsCards from "./_components/CompanyCards";

export default async function OrganizationsPage() {
    const session = await auth();
    const user = session?.user;

    if (!user?.id) {
        redirect("/sign-in");
    }

    const companies = await getCompaniesAction({ userId: user.id });

    if (!companies.success) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-2xl font-bold">Error</h1>
                <p className="text-sm text-gray-500">{companies.error}</p>
            </div>
        )
    }

  return <OrganizationsCards companies={companies.companies} userId={user.id} />
}