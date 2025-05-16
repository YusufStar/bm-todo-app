"use client"
import { TeamSwitcher } from "@/components/team-switcher"
import { Separator } from "@/components/ui/separator"
import { useTeamContext } from "@/context/team-provider"
import { Loader } from "lucide-react"

export default function CustomLayout({
    children,
    teamId
}: {
    children: React.ReactNode
    teamId: string | undefined
}) {
    const { isLoading } = useTeamContext()

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="flex items-center gap-2">
                    <Loader className="animate-spin text-muted-foreground" />
                    <h2 className="text-muted-foreground">System Loading...</h2>
                </div>
            </div>
        )
    }

    return (
        <>
            {
                teamId ? children : <div className="flex flex-1 items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">No Team Selected</h2>
                        <p className="mt-2 text-gray-500">Please select a team to view the dashboard.</p>
                        <Separator className="my-4" />
                        <TeamSwitcher />
                    </div>
                </div>
            }
        </>
    )
}