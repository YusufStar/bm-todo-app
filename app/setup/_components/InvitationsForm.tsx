"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    acceptCompanyInvitationAction,
    declineCompanyInvitationAction,
    getUserInvitationsAction
} from "@/actions/member/actions";
import {
    Spinner,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Divider,
    Badge,
    Avatar,
    Chip
} from "@heroui/react";
import { CompanyRole, InvitationStatus } from "@prisma/client";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import { useRouter } from "next/navigation";
import { companyMemberColorMap, invitationStatusColorMap } from "@/types/members";
import InvitationsDetailModal from "@/app/setup/_components/InvitationsDetailModal";

// For HeroUI components
type ChipColorType = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined;

// Function to get role badge style based on role
const getRoleBadgeStyle = (role: CompanyRole) => {
    const colorMap: Record<CompanyRole, any> = {
        OWNER: {
            bgColor: "bg-danger/10",
            textColor: "text-danger",
            borderColor: "border-danger/20"
        },
        ADMIN: {
            bgColor: "bg-warning/10",
            textColor: "text-warning",
            borderColor: "border-warning/20"
        },
        MEMBER: {
            bgColor: "bg-primary/10",
            textColor: "text-primary",
            borderColor: "border-primary/20"
        }
    };

    return colorMap[role] || {
        bgColor: "bg-default/10",
        textColor: "text-default-600",
        borderColor: "border-default/20"
    };
};

interface Company {
    id: string;
    name: string;
    logo: string | null;
}

interface Invitation {
    id: string;
    companyId: string;
    senderEmail: string;
    invitedEmail: string;
    role: CompanyRole;
    status: InvitationStatus;
    acceptedAt: Date | null;
    rejectedAt: Date | null;
    cancelledAt: Date | null;
    expiredAt: Date | null;
    expiresAt: Date;
    message: string | null;
    createdAt: Date;
    updatedAt: Date;
    company: Company;
}

interface InvitationsResponse {
    success: boolean;
    invitations: Invitation[];
    error?: string;
}

export default function InvitationsForm() {
    const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data, isLoading } = useQuery<InvitationsResponse>({
        queryKey: ["invitations"],
        queryFn: async () => {
            const result = await getUserInvitationsAction();
            return result as InvitationsResponse;
        },
    });

    console.log(data);

    const acceptMutation = useMutation({
        mutationFn: (invitationId: string) => acceptCompanyInvitationAction(invitationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invitations"] });
            setIsModalOpen(false);
            router.replace("/dashboard");
        }
    });

    const declineMutation = useMutation({
        mutationFn: (invitationId: string) => declineCompanyInvitationAction(invitationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invitations"] });
            setIsModalOpen(false);
        }
    });

    const handleAccept = (invitationId: string) => {
        acceptMutation.mutate(invitationId);
    };

    const handleDecline = (invitationId: string) => {
        declineMutation.mutate(invitationId);
    };

    const openModal = (invitation: Invitation) => {
        setSelectedInvitation(invitation);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedInvitation(null);
    };

    const isExpired = (invitation: Invitation) => {
        return isPast(new Date(invitation.expiresAt));
    };

    const formatExpirationDate = (date: Date) => {
        if (isToday(date)) {
            return `Expires today at ${format(date, "HH:mm")}`;
        } else if (isTomorrow(date)) {
            return `Expires tomorrow at ${format(date, "HH:mm")}`;
        } else if (isPast(date)) {
            return `Expired ${formatDistanceToNow(date, { addSuffix: true })}`;
        } else {
            return `Expires in ${formatDistanceToNow(date, { addSuffix: false })}`;
        }
    };

    // Function to get expiration status color
    const getExpirationChipColor = (date: Date): ChipColorType => {
        if (isPast(date)) {
            return "danger";
        } else if (isToday(date) || isTomorrow(date)) {
            return "warning";
        } else {
            return "success";
        }
    };

    // Function to get status message based on invitation status
    const getStatusMessage = (invitation: Invitation) => {
        switch (invitation.status) {
            case "ACCEPTED":
                return "You've accepted this invitation";
            case "REJECTED":
                return "You've declined this invitation";
            case "CANCELLED":
                return "This invitation was cancelled";
            case "EXPIRED":
                return "This invitation has expired";
            case "PENDING":
            default:
                return "You've been invited to join this company";
        }
    };

    // Function to get status chip color based on invitation status
    const getStatusChipColor = (status: InvitationStatus): ChipColorType => {
        switch (status) {
            case "ACCEPTED":
                return "success";
            case "REJECTED":
                return "danger";
            case "CANCELLED":
                return "default";
            case "EXPIRED":
                return "secondary";
            case "PENDING":
            default:
                return "warning";
        }
    };

    // Function to check if invitation can have actions taken
    const canTakeAction = (invitation: Invitation) => {
        return invitation.status === "PENDING" && !isExpired(invitation);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full p-10">
            <Spinner size="lg" color="primary" />
        </div>;
    }

    if (!data || !data.invitations || data.invitations.length === 0) {
        return <div className="flex justify-center items-center h-full p-10 text-foreground-500">
            <div className="text-center space-y-4">
                <div className="text-4xl">📫</div>
                <p className="text-lg">No invitations found</p>
                <p className="text-sm">You don&apos;t have any pending invitations at the moment</p>
            </div>
        </div>;
    }

    // Group invitations by status
    const pendingInvitations = data.invitations.filter((inv: Invitation) => 
        inv.status === "PENDING" && !isExpired(inv)
    );
    
    const processedInvitations = data.invitations.filter((inv: Invitation) => 
        inv.status !== "PENDING" || isExpired(inv)
    );

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                {pendingInvitations.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-foreground-500">Pending Invitations</h2>
                        <div className="flex flex-col gap-4">
                            {pendingInvitations.map((invitation: Invitation) => (
                                <Card fullWidth key={invitation.id} className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-divider">
                                    <CardHeader className="flex gap-3 pb-2">
                                        <div className="flex gap-3 items-center">
                                            <Avatar
                                                showFallback
                                                name={invitation.company.name}
                                                src={invitation.company.logo || undefined}
                                                className="bg-primary/20 text-primary"
                                            />
                                            <div className="flex flex-col">
                                                <p className="text-md font-semibold">{invitation.company.name}</p>
                                                <p className="text-small text-foreground-500">From: {invitation.senderEmail}</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardBody className="py-2">
                                        <p className="text-sm">{getStatusMessage(invitation)}</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {/* Role badge */}
                                            <div className={`
                                                inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full 
                                                border ${getRoleBadgeStyle(invitation.role).borderColor} 
                                                ${getRoleBadgeStyle(invitation.role).bgColor} 
                                                ${getRoleBadgeStyle(invitation.role).textColor}
                                                font-medium text-xs capitalize
                                            `}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${getRoleBadgeStyle(invitation.role).textColor.replace('text-', 'bg-')}`}></span>
                                                {String(invitation.role).toLowerCase()}
                                            </div>
                                            
                                            {/* Expiration chip */}
                                            <Chip
                                                className="capitalize border-none gap-1 text-default-600"
                                                color={getExpirationChipColor(new Date(invitation.expiresAt))}
                                                size="sm"
                                                variant="dot"
                                            >
                                                {formatExpirationDate(new Date(invitation.expiresAt))}
                                            </Chip>
                                        </div>
                                        <p className="mt-2 text-xs text-foreground-400">
                                            Invited on {format(new Date(invitation.createdAt), "PPP")}
                                        </p>
                                    </CardBody>
                                    <CardFooter className="flex gap-2 pt-2">
                                        <Button
                                            fullWidth
                                            color="primary"
                                            size="sm"
                                            onPress={() => handleAccept(invitation.id)}
                                            isLoading={acceptMutation.isPending && acceptMutation.variables === invitation.id}
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            fullWidth
                                            color="danger"
                                            variant="flat"
                                            size="sm"
                                            onPress={() => handleDecline(invitation.id)}
                                            isLoading={declineMutation.isPending && declineMutation.variables === invitation.id}
                                        >
                                            Decline
                                        </Button>
                                        <Button
                                            fullWidth
                                            color="default"
                                            variant="flat"
                                            size="sm"
                                            onPress={() => openModal(invitation)}
                                        >
                                            Details
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {processedInvitations.length > 0 && (
                    <div className={`${pendingInvitations.length > 0 ? 'mt-8' : ''} space-y-4`}>
                        {pendingInvitations.length > 0 && <Divider className="my-6" />}
                        <h2 className="text-lg font-semibold text-foreground-500">Other Invitations</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {processedInvitations.map((invitation: Invitation) => {
                                const isExpiredInvitation = isExpired(invitation);
                                const statusColor = getStatusChipColor(invitation.status);
                                
                                return (
                                    <Card key={invitation.id} className={`${invitation.status !== 'ACCEPTED' ? 'opacity-80' : ''}`}>
                                        <CardHeader className="flex gap-3 pb-2">
                                            <div className="flex gap-3 items-center">
                                                <Avatar
                                                    showFallback
                                                    name={invitation.company.name}
                                                    src={invitation.company.logo || undefined}
                                                    className={`${invitation.status === 'ACCEPTED' ? 'bg-primary/20 text-primary' : 'bg-default/30'}`}
                                                />
                                                <div className="flex flex-col">
                                                    <p className="text-md font-semibold">{invitation.company.name}</p>
                                                    <p className="text-small text-foreground-500">From: {invitation.senderEmail}</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardBody className="py-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Chip
                                                    className="capitalize border-none"
                                                    color={statusColor}
                                                    size="sm"
                                                    variant="solid"
                                                >
                                                    {invitation.status.toLowerCase()}
                                                </Chip>
                                            </div>
                                            <p className="text-sm">{getStatusMessage(invitation)}</p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {/* Role badge with adjusted opacity for non-active invitations */}
                                                <div className={`
                                                    inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full 
                                                    border ${invitation.status === 'ACCEPTED' 
                                                        ? getRoleBadgeStyle(invitation.role).borderColor 
                                                        : 'border-default/20'} 
                                                    ${invitation.status === 'ACCEPTED' 
                                                        ? getRoleBadgeStyle(invitation.role).bgColor 
                                                        : 'bg-default/10'} 
                                                    ${invitation.status === 'ACCEPTED' 
                                                        ? getRoleBadgeStyle(invitation.role).textColor 
                                                        : 'text-default-600'}
                                                    font-medium text-xs capitalize
                                                `}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${invitation.status === 'ACCEPTED' 
                                                        ? getRoleBadgeStyle(invitation.role).textColor.replace('text-', 'bg-') 
                                                        : 'bg-default-600'}`}></span>
                                                    {String(invitation.role).toLowerCase()}
                                                </div>
                                                
                                                {/* Only show expiration for EXPIRED invitations or PENDING invitations that expired */}
                                                {(invitation.status === 'EXPIRED' || (invitation.status === 'PENDING' && isExpiredInvitation)) && (
                                                    <Chip
                                                        className="capitalize border-none gap-1 text-default-600"
                                                        color="danger"
                                                        variant="dot"
                                                        size="sm"
                                                    >
                                                        {formatExpirationDate(new Date(invitation.expiresAt))}
                                                    </Chip>
                                                )}
                                            </div>
                                            <p className="mt-2 text-xs text-foreground-400">
                                                {invitation.status === 'ACCEPTED' && invitation.acceptedAt && (
                                                    <>Accepted on {format(new Date(invitation.acceptedAt), "PPP")}</>
                                                )}
                                                {invitation.status === 'REJECTED' && invitation.rejectedAt && (
                                                    <>Declined on {format(new Date(invitation.rejectedAt), "PPP")}</>
                                                )}
                                                {invitation.status === 'CANCELLED' && invitation.cancelledAt && (
                                                    <>Cancelled on {format(new Date(invitation.cancelledAt), "PPP")}</>
                                                )}
                                                {invitation.status === 'EXPIRED' && invitation.expiredAt && (
                                                    <>Expired on {format(new Date(invitation.expiredAt), "PPP")}</>
                                                )}
                                                {invitation.status === 'PENDING' && (
                                                    <>Invited on {format(new Date(invitation.createdAt), "PPP")}</>
                                                )}
                                            </p>
                                        </CardBody>
                                        <CardFooter>
                                            {invitation.status === 'ACCEPTED' ? (
                                                <Button
                                                    fullWidth
                                                    color="primary"
                                                    variant="flat"
                                                    size="sm"
                                                    onPress={() => router.push("/dashboard")}
                                                >
                                                    Go to Dashboard
                                                </Button>
                                            ) : (
                                                <Button
                                                    fullWidth
                                                    color="default"
                                                    variant="flat"
                                                    size="sm"
                                                    onPress={() => openModal(invitation)}
                                                >
                                                    View Details
                                                </Button>
                                            )}
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <InvitationsDetailModal
                isOpen={isModalOpen}
                onClose={closeModal}
                invitation={selectedInvitation}
                onAccept={handleAccept}
                onDecline={handleDecline}
                acceptLoading={!!(acceptMutation.isPending && selectedInvitation && acceptMutation.variables === selectedInvitation.id)}
                declineLoading={!!(declineMutation.isPending && selectedInvitation && declineMutation.variables === selectedInvitation.id)}
            />
        </div>
    );
}