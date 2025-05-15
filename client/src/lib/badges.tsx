import { TeamStatus } from "@/validate"

export const TeamStatusBadge = ({
    status,
    className,
}: {
    status: TeamStatus
    className?: string
}) => {
    const statusMap: Record<TeamStatus, string> = {
        [TeamStatus.ACTIVE]: "bg-green-100",
        [TeamStatus.ARCHIVED]: "bg-red-100",
        [TeamStatus.DELETED]: "bg-gray-100",
        [TeamStatus.INACTIVE]: "bg-yellow-100",
        [TeamStatus.PAUSED]: "bg-blue-100",
    }

    return (
        <span
            className={`inline-flex rounded-full w-4 h-4 ${statusMap[status] || statusMap.active} ${className}`}
        />
    )
}