import { getCompanies } from "@/actions/company/get"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import SetupPageContent from "./_components/SetupPageContent"
import { User } from "@prisma/client"

export default async function Setup() {
    const session = await auth()

    if (!session?.user) {
        redirect("/sign-in")
    }

    const companies = await getCompanies(session?.user.id ?? "")

    if (companies.length > 0) {
        redirect("/dashboard")
    }

    return (
        <div className="flex flex-col gap-4 h-screen overflow-hidden justify-center items-center">
            <Suspense fallback={<div>Loading...</div>}>
                <SetupPageContent user={session.user as User} />
            </Suspense>
        </div>
    );
}