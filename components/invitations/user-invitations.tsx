"use client";

import React from "react";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Button,
    Chip,
    Spinner,
    Divider
} from "@heroui/react";
import { formatDistanceToNow } from 'date-fns';
import { useInvitations } from "@/lib/hooks";
import { invitationStatusColorMap } from "@/types/members";
import { InvitationStatus } from "@/types/forms";
import { Building, CalendarClock } from "lucide-react";

// Define color type to match HeroUI Chip component requirements
type ChipColorType = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined;

export function UserInvitations() {
    const [mounted, setMounted] = React.useState(false);

    const {
        userInvitations,
        isLoadingUser,
        isError,
        error,
        acceptInvitation,
        declineInvitation,
        isAccepting,
        isDeclining,
        refetchUserInvitations
    } = useInvitations({ type: 'user' });

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Show error state
    if (isError) {
        return (
            <div className="flex flex-col justify-center items-center h-40 gap-4">
                <p className="text-danger text-center">Error loading invitations: {error}</p>
                <Button color="primary" onPress={() => refetchUserInvitations()}>Retry</Button>
            </div>
        );
    }

    // Show loading state
    if (isLoadingUser) {
        return (
            <div className="flex justify-center items-center h-40">
                <Spinner />
            </div>
        );
    }

    // Show empty state
    if (userInvitations.length === 0) {
        return (
            <div className="text-center py-8 text-default-500">
                <p>You don't have any pending invitations</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Invitations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userInvitations.map((invitation) => (
                    <Card key={invitation.id} className="w-full">
                        <CardHeader className="flex justify-between items-start pb-2">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <Building size={16} className="text-primary" />
                                    <h3 className="font-medium">{invitation.company?.name || 'Company'}</h3>
                                </div>
                                <p className="text-small text-default-500">{invitation.invitedEmail}</p>
                            </div>
                            <Chip
                                className="capitalize border-none gap-1 text-default-600"
                                color={invitationStatusColorMap[invitation.status] as ChipColorType}
                                size="sm"
                                variant="dot"
                            >
                                {invitation.status.toLowerCase()}
                            </Chip>
                        </CardHeader>
                        <Divider />
                        <CardBody className="py-3">
                            <div className="flex items-center gap-2 text-small">
                                <CalendarClock size={14} className="text-default-400" />
                                <span className="text-default-500">
                                    Sent {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                            {invitation.message && (
                                <p className="text-small mt-2 text-default-700">{invitation.message}</p>
                            )}
                        </CardBody>
                        <CardFooter className="gap-2">
                            {invitation.status === InvitationStatus.PENDING && (
                                <>
                                    <Button
                                        color="primary"
                                        variant="flat"
                                        className="flex-1"
                                        onPress={() => acceptInvitation(invitation.id)}
                                        isLoading={isAccepting}
                                        isDisabled={isAccepting || isDeclining}
                                    >
                                        Accept
                                    </Button>
                                    <Button
                                        color="danger"
                                        variant="flat"
                                        className="flex-1"
                                        onPress={() => declineInvitation(invitation.id)}
                                        isLoading={isDeclining}
                                        isDisabled={isAccepting || isDeclining}
                                    >
                                        Decline
                                    </Button>
                                </>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
} 