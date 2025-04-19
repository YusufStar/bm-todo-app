import { getCompanies } from "@/actions/company/get"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export default async function Setup() {
    const session = await auth()
    const headersList = headers();
    const referer = headersList.get("referer") || "";
    
    // Check if we're coming from dashboard to prevent redirect loops
    const comingFromDashboard = referer.includes("/dashboard");

    if (!session?.user) {
        redirect("/sign-in")
    }

    const companies = await getCompanies(session?.user.id ?? "")

    // Only redirect to dashboard if we have companies and we're not coming from dashboard
    if (companies.length > 0 && !comingFromDashboard) {
        redirect("/dashboard")
    }

    return (
        <div>
            <h1>Setup</h1>
        </div>
    )
}