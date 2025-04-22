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

    // Separate active and expired invitations
    const activeInvitations = data.invitations.filter((inv: Invitation) => !isExpired(inv));
    const expiredInvitations = data.invitations.filter((inv: Invitation) => isExpired(inv));

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                {activeInvitations.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-foreground-500">Active Invitations</h2>
                        <div className="flex flex-col gap-4">
                            {activeInvitations.map((invitation: Invitation) => (
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
                                        <p className="text-sm">You&apos;ve been invited to join this company</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {/* Custom styled role badge */}
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

                {expiredInvitations.length > 0 && (
                    <div className="mt-8 space-y-4">
                        <Divider className="my-6" />
                        <h2 className="text-lg font-semibold text-foreground-500">Expired Invitations</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {expiredInvitations.map((invitation: Invitation) => (
                                <Card key={invitation.id} className="opacity-70 grayscale">
                                    <CardHeader className="flex gap-3 pb-2">
                                        <div className="flex gap-3 items-center">
                                            <Avatar 
                                                showFallback
                                                name={invitation.company.name} 
                                                src={invitation.company.logo || undefined}
                                                className="bg-default/30"
                                            />
                                            <div className="flex flex-col">
                                                <p className="text-md font-semibold">{invitation.company.name}</p>
                                                <p className="text-small text-foreground-500">From: {invitation.senderEmail}</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardBody className="py-2">
                                        <p className="text-sm">This invitation has expired</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {/* Custom styled role badge */}
                                            <div className={`
                                                inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full 
                                                border border-default/20 bg-default/10 text-default-600
                                                font-medium text-xs capitalize
                                            `}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-default-600"></span>
                                                {String(invitation.role).toLowerCase()}
                                            </div>
                                            <Chip 
                                                className="capitalize border-none gap-1 text-default-600"
                                                color="danger" 
                                                variant="dot"
                                                size="sm"
                                            >
                                                {formatExpirationDate(new Date(invitation.expiresAt))}
                                            </Chip>
                                        </div>
                                        <p className="mt-2 text-xs text-foreground-400">
                                            Invited on {format(new Date(invitation.createdAt), "PPP")}
                                        </p>
                                    </CardBody>
                                    <CardFooter>
                                        <p className="text-sm text-foreground-500 w-full text-center">No actions available</p>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <ModalContent>
                    {selectedInvitation && (
                        <>
                            <ModalHeader className="flex flex-col gap-1 pb-2">
                                <div className="flex gap-3 items-center">
                                    <Avatar 
                                        showFallback
                                        size="lg"
                                        name={selectedInvitation.company.name} 
                                        src={selectedInvitation.company.logo || undefined}
                                        className="bg-primary/20 text-primary"
                                    />
                                    <div>
                                        <h2 className="text-xl font-bold mb-1">{selectedInvitation.company.name}</h2>
                                    </div>
                                </div>
                            </ModalHeader>
                            <Divider />
                            <ModalBody className="py-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Card className="bg-default-50/50 shadow-none border-none p-0">
                                        <CardBody className="p-3">
                                            <div className="flex gap-2 items-center mb-1">
                                                <div className="p-1.5 rounded-full bg-primary/10">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V8L12 13L20 8V18ZM12 11L4 6H20L12 11Z" fill="currentColor"/>
                                                    </svg>
                                                </div>
                                                <h3 className="text-sm font-semibold text-foreground-500">From</h3>
                                            </div>
                                            <p className="text-sm pl-7">{selectedInvitation.senderEmail}</p>
                                        </CardBody>
                                    </Card>
                                    
                                    <Card className="bg-default-50/50 shadow-none border-none p-0">
                                        <CardBody className="p-3">
                                            <div className="flex gap-2 items-center mb-1">
                                                <div className="p-1.5 rounded-full bg-primary/10">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12 12.75C13.63 12.75 15.07 13.14 16.24 13.65C17.32 14.13 18 15.21 18 16.38V18H6V16.39C6 15.21 6.68 14.13 7.76 13.66C8.93 13.14 10.37 12.75 12 12.75ZM4 13C5.1 13 6 12.1 6 11C6 9.9 5.1 9 4 9C2.9 9 2 9.9 2 11C2 12.1 2.9 13 4 13ZM5.13 14.1C4.76 14.04 4.39 14 4 14C3.01 14 2.07 14.21 1.22 14.58C0.48 14.9 0 15.62 0 16.43V18H4.5V16.39C4.5 15.56 4.73 14.78 5.13 14.1ZM20 13C21.1 13 22 12.1 22 11C22 9.9 21.1 9 20 9C18.9 9 18 9.9 18 11C18 12.1 18.9 13 20 13ZM24 16.43C24 15.62 23.52 14.9 22.78 14.58C21.93 14.21 20.99 14 20 14C19.61 14 19.24 14.04 18.87 14.1C19.27 14.78 19.5 15.56 19.5 16.39V18H24V16.43ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6Z" fill="currentColor"/>
                                                    </svg>
                                                </div>
                                                <h3 className="text-sm font-semibold text-foreground-500">Role</h3>
                                            </div>
                                            <div className="pl-7">
                                                <div className={`
                                                    inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full 
                                                    border ${getRoleBadgeStyle(selectedInvitation.role).borderColor} 
                                                    ${getRoleBadgeStyle(selectedInvitation.role).bgColor} 
                                                    ${getRoleBadgeStyle(selectedInvitation.role).textColor}
                                                    font-medium text-xs capitalize
                                                `}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${getRoleBadgeStyle(selectedInvitation.role).textColor.replace('text-', 'bg-')}`}></span>
                                                    {String(selectedInvitation.role).toLowerCase()}
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                    
                                    <Card className="bg-default-50/50 shadow-none border-none p-0">
                                        <CardBody className="p-3">
                                            <div className="flex gap-2 items-center mb-1">
                                                <div className="p-1.5 rounded-full bg-primary/10">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8ZM9 14H7V12H9V14ZM13 14H11V12H13V14ZM17 14H15V12H17V14ZM9 18H7V16H9V18ZM13 18H11V16H13V18ZM17 18H15V16H17V18Z" fill="currentColor"/>
                                                    </svg>
                                                </div>
                                                <h3 className="text-sm font-semibold text-foreground-500">Invited On</h3>
                                            </div>
                                            <p className="text-sm pl-7">{format(new Date(selectedInvitation.createdAt), "PP 'at' HH:mm")}</p>
                                        </CardBody>
                                    </Card>
                                    
                                    <Card className="bg-default-50/50 shadow-none border-none p-0">
                                        <CardBody className="p-3">
                                            <div className="flex gap-2 items-center mb-1">
                                                <div className="p-1.5 rounded-full bg-primary/10">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="currentColor"/>
                                                    </svg>
                                                </div>
                                                <h3 className="text-sm font-semibold text-foreground-500">Expires</h3>
                                            </div>
                                            <div className="pl-7">
                                                <p className="text-sm">{format(new Date(selectedInvitation.expiresAt), "PP 'at' HH:mm")}</p>
                                                <Chip 
                                                    className="mt-1 capitalize border-none gap-1 text-default-600"
                                                    color={getExpirationChipColor(new Date(selectedInvitation.expiresAt))}
                                                    size="sm"
                                                    variant="dot"
                                                >
                                                    {formatExpirationDate(new Date(selectedInvitation.expiresAt))}
                                                </Chip>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </div>
                                
                                {selectedInvitation.message && (
                                    <div className="mt-3">
                                        <div className="flex gap-2 items-center mb-1">
                                            <div className="p-1.5 rounded-full bg-primary/10">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4.58 16.59L4 17.17V4H20V16ZM10.5 14H18V12H12.5L10.5 14ZM14.36 8.13C14.56 7.93 14.56 7.62 14.36 7.42L12.59 5.65C12.39 5.45 12.08 5.45 11.88 5.65L6 11.53V14H8.47L14.36 8.13Z" fill="currentColor"/>
                                                </svg>
                                            </div>
                                            <h3 className="text-sm font-semibold text-foreground-500">Message</h3>
                                        </div>
                                        <div className="p-3 bg-primary/5 rounded-lg ml-7">
                                            <p className="text-sm">{selectedInvitation.message}</p>
                                        </div>
                                    </div>
                                )}
                            </ModalBody>
                            <Divider />
                            <ModalFooter>
                                {!isExpired(selectedInvitation) ? (
                                    <div className="flex w-full gap-2">
                                        <Button 
                                            fullWidth
                                            color="primary" 
                                            onPress={() => handleAccept(selectedInvitation.id)}
                                            isLoading={acceptMutation.isPending && acceptMutation.variables === selectedInvitation.id}
                                        >
                                            Accept
                                        </Button>
                                        <Button 
                                            fullWidth
                                            color="danger" 
                                            variant="flat" 
                                            onPress={() => handleDecline(selectedInvitation.id)}
                                            isLoading={declineMutation.isPending && declineMutation.variables === selectedInvitation.id}
                                        >
                                            Decline
                                        </Button>
                                    </div>
                                ) : (
                                    <Button fullWidth color="default" variant="light" onPress={closeModal}>
                                        Close
                                    </Button>
                                )}
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}