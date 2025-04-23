"use client";

import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Divider,
  Card, 
  CardBody,
  Avatar,
  Button,
  Chip
} from "@heroui/react";
import { CompanyRole, InvitationStatus } from "@prisma/client";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";

// For HeroUI components
type ChipColorType = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined;

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

interface InvitationsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: Invitation | null;
  onAccept: (invitationId: string) => void;
  onDecline: (invitationId: string) => void;
  acceptLoading: boolean;
  declineLoading: boolean;
}

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

// Function to get status chip color
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

export default function InvitationsDetailModal({
  isOpen,
  onClose,
  invitation,
  onAccept,
  onDecline,
  acceptLoading,
  declineLoading
}: InvitationsDetailModalProps) {
  if (!invitation) return null;

  const canTakeAction = invitation.status === "PENDING" && !isExpired(invitation);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 pb-2">
          <div className="flex gap-3 items-center">
            <Avatar 
              showFallback
              size="lg"
              name={invitation.company.name} 
              src={invitation.company.logo || undefined}
              className="bg-primary/20 text-primary"
            />
            <div>
              <h2 className="text-xl font-bold mb-1">{invitation.company.name}</h2>
            </div>
          </div>
        </ModalHeader>
        <Divider />
        <ModalBody className="py-3">
          <div className="mb-3">
            <Chip
              className="capitalize border-none gap-1"
              color={getStatusChipColor(invitation.status)}
              size="sm"
              variant="solid"
            >
              {invitation.status.toLowerCase()}
            </Chip>
          </div>
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
                <p className="text-sm pl-7">{invitation.senderEmail}</p>
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
                    border ${getRoleBadgeStyle(invitation.role).borderColor} 
                    ${getRoleBadgeStyle(invitation.role).bgColor} 
                    ${getRoleBadgeStyle(invitation.role).textColor}
                    font-medium text-xs capitalize
                  `}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getRoleBadgeStyle(invitation.role).textColor.replace('text-', 'bg-')}`}></span>
                    {String(invitation.role).toLowerCase()}
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
                <p className="text-sm pl-7">{format(new Date(invitation.createdAt), "PP 'at' HH:mm")}</p>
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
                  <p className="text-sm">{format(new Date(invitation.expiresAt), "PP 'at' HH:mm")}</p>
                  <Chip 
                    className="mt-1 capitalize border-none gap-1 text-default-600"
                    color={getExpirationChipColor(new Date(invitation.expiresAt))}
                    size="sm"
                    variant="dot"
                  >
                    {formatExpirationDate(new Date(invitation.expiresAt))}
                  </Chip>
                </div>
              </CardBody>
            </Card>
          </div>
          
          {/* Status specific information */}
          {invitation.status === "ACCEPTED" && invitation.acceptedAt && (
            <Card className="mt-3 bg-success-50 border-success/20">
              <CardBody className="p-3">
                <div className="flex gap-2 items-center">
                  <div className="p-1.5 rounded-full bg-success/20 text-success">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-success-600">
                    Accepted on {format(new Date(invitation.acceptedAt), "PP 'at' HH:mm")}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
          
          {invitation.status === "REJECTED" && invitation.rejectedAt && (
            <Card className="mt-3 bg-danger-50 border-danger/20">
              <CardBody className="p-3">
                <div className="flex gap-2 items-center">
                  <div className="p-1.5 rounded-full bg-danger/20 text-danger">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-danger-600">
                    Declined on {format(new Date(invitation.rejectedAt), "PP 'at' HH:mm")}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
          
          {invitation.status === "CANCELLED" && invitation.cancelledAt && (
            <Card className="mt-3 bg-default-100 border-default/20">
              <CardBody className="p-3">
                <div className="flex gap-2 items-center">
                  <div className="p-1.5 rounded-full bg-default/20 text-default-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM9 16H15V14H9V16ZM12 7C10.9 7 10 7.9 10 9C10 10.1 10.9 11 12 11C13.1 11 14 10.1 14 9C14 7.9 13.1 7 12 7Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-default-600">
                    Cancelled on {format(new Date(invitation.cancelledAt), "PP 'at' HH:mm")}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
          
          {invitation.message && (
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
                <p className="text-sm">{invitation.message}</p>
              </div>
            </div>
          )}
        </ModalBody>
        <Divider />
        <ModalFooter className="flex justify-between">
          <Button
            variant="flat"
            color="default"
            onPress={onClose}
            className="flex-1"
          >
            Close
          </Button>
          
          {canTakeAction && (
            <>
              <Button
                variant="flat"
                color="danger"
                onPress={() => onDecline(invitation.id)}
                isLoading={declineLoading}
                className="flex-1"
              >
                Decline
              </Button>
              <Button
                color="primary"
                onPress={() => onAccept(invitation.id)}
                isLoading={acceptLoading}
                className="flex-1"
              >
                Accept
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
