"use client"

import React from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Chip,
    Spinner,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@heroui/react";
import { SortDirection } from "@react-types/shared";
import { MoreVertical, Search, Plus, Mail, Clock, Calendar } from "lucide-react";
import { formatDistanceToNow, isPast, isToday, format } from 'date-fns';
import { useInvitations, useTable } from "@/lib/hooks";
import { CompanyInvitation } from "@/lib/store/invitationStore";
import { invitationStatusColorMap } from "@/types/members";
import { InvitationStatus } from "@/types/forms";
import { useRouter } from "next/navigation";
import { InviteMemberForm } from "./invite-member-form";

// Define color type to match HeroUI Chip component requirements
type ChipColorType = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined;

// Define columns for the invitation table
const columns = [
    { name: "EMAIL", uid: "invitedEmail", sortable: true },
    { name: "SENT BY", uid: "senderEmail", sortable: true },
    { name: "STATUS", uid: "status", sortable: true },
    { name: "EXPIRES", uid: "expiresAt", sortable: true },
    { name: "SENT DATE", uid: "createdAt", sortable: true },
    { name: "ACTIONS", uid: "actions" },
];

// Helper function to capitalize strings
function capitalize(s: string) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export default function InvitationsTable() {
    const router = useRouter();
    const [mounted, setMounted] = React.useState(false);
    const [filterValue, setFilterValue] = React.useState("");
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Fetch invitations data using our custom hook
    const {
        companyInvitations,
        isLoading,
        isError,
        error,
        cancelInvitation,
        inviteMember,
        isInviting,
        isCancelling,
        refetchCompanyInvitations
    } = useInvitations();

    // Use table hook for the UI state of the table
    const {
        selectedKeys,
        handleSelectionChange,
        sortDescriptor,
        handleSortChange
    } = useTable<CompanyInvitation>({
        columns,
        filterField: 'invitedEmail' as keyof CompanyInvitation
    });

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Filter invitations based on search input
    const filteredInvitations = React.useMemo(() => {
        if (!filterValue.trim()) return companyInvitations;

        return companyInvitations.filter(invitation => 
            invitation.invitedEmail.toLowerCase().includes(filterValue.toLowerCase()) ||
            invitation.senderEmail.toLowerCase().includes(filterValue.toLowerCase())
        );
    }, [companyInvitations, filterValue]);

    const handleSearch = (value: string) => {
        setFilterValue(value);
    };

    const handleInvite = async (formData: { email: string }) => {
        await inviteMember(formData.email);
        onClose(); // Close modal after submission
    };

    const renderCell = React.useCallback((invitation: CompanyInvitation, columnKey: string): React.ReactNode => {
        switch (columnKey) {
            case "invitedEmail":
                return (
                    <div className="flex items-center gap-2">
                        <Mail size={16} className="text-default-400" />
                        <span>{invitation.invitedEmail}</span>
                    </div>
                );
            case "senderEmail":
                return <span>{invitation.senderEmail}</span>;
            case "status":
                return (
                    <Chip
                        className="capitalize border-none gap-1 text-default-600"
                        color={invitationStatusColorMap[invitation.status] as ChipColorType}
                        size="sm"
                        variant="dot"
                    >
                        {invitation.status.toLowerCase()}
                    </Chip>
                );
            case "expiresAt":
                if (!invitation.expiresAt) return <span className="text-default-400">Not set</span>;

                const expiresAt = new Date(invitation.expiresAt);
                const isExpired = isPast(expiresAt) && !isToday(expiresAt);

                if (invitation.status !== InvitationStatus.PENDING) {
                    return <span className="text-default-400">-</span>;
                }

                return (
                    <div className="flex items-center gap-2">
                        <Clock size={16} className={isExpired ? "text-danger" : "text-default-400"} />
                        <span className={isExpired ? "text-danger font-medium" : ""}>
                            {isToday(expiresAt)
                                ? "Today"
                                : formatDistanceToNow(expiresAt, { addSuffix: true })}
                        </span>
                    </div>
                );
            case "createdAt":
                return (
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-default-400" />
                        <span>
                            {format(new Date(invitation.createdAt), 'PPP')}
                        </span>
                    </div>
                );
            case "actions":
                if (invitation.status !== InvitationStatus.PENDING) {
                    return <span className="text-default-400">-</span>;
                }
                
                return (
                    <div className="relative flex justify-end items-center gap-2">
                        <Dropdown className="bg-background border-1 border-default-200">
                            <DropdownTrigger>
                                <Button isIconOnly radius="full" size="sm" variant="light">
                                    <MoreVertical className="text-default-400" size={18} />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                                <DropdownItem
                                    key="resend"
                                    className="text-primary"
                                >
                                    Resend Invitation
                                </DropdownItem>
                                <DropdownItem
                                    key="cancel"
                                    className="text-danger"
                                    color="danger"
                                    onPress={() => cancelInvitation(invitation.id)}
                                    isDisabled={isCancelling}
                                >
                                    Cancel Invitation
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                );
            default:
                const value = invitation[columnKey as keyof CompanyInvitation];
                return typeof value === 'object' && value !== null 
                    ? JSON.stringify(value) 
                    : String(value);
        }
    }, [cancelInvitation, isCancelling]);

    const topContent = React.useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        classNames={{
                            base: "w-full sm:max-w-[44%]",
                            inputWrapper: "border-1",
                        }}
                        placeholder="Search by email..."
                        size="sm"
                        startContent={<Search className="text-default-300" size={18} />}
                        value={filterValue}
                        variant="bordered"
                        onClear={() => handleSearch("")}
                        onValueChange={handleSearch}
                    />
                    <div className="flex gap-3">
                        <Button
                            className="bg-foreground text-background"
                            endContent={<Plus size={16} />}
                            size="sm"
                            onPress={onOpen}
                        >
                            Invite Member
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {filteredInvitations.length} invitations</span>
                </div>
            </div>
        );
    }, [
        filterValue,
        handleSearch,
        filteredInvitations.length,
        onOpen
    ]);

    const classNames = React.useMemo(
        () => ({
            wrapper: ["max-h-[382px]", "max-w-3xl"],
            th: ["bg-transparent", "text-default-500", "border-b", "border-divider"],
            td: [
                // changing the rows border radius
                // first
                "group-data-[first=true]/tr:first:before:rounded-none",
                "group-data-[first=true]/tr:last:before:rounded-none",
                // middle
                "group-data-[middle=true]/tr:before:rounded-none",
                // last
                "group-data-[last=true]/tr:first:before:rounded-none",
                "group-data-[last=true]/tr:last:before:rounded-none",
            ],
        }),
        [],
    );

    if (!mounted) return null;

    // Show error state
    if (isError) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <p className="text-danger text-center">Error loading invitations: {error}</p>
                <Button color="primary" onPress={() => refetchCompanyInvitations()}>Retry</Button>
            </div>
        );
    }

    return (
        <>
            <Table
                isCompact
                removeWrapper
                aria-label="Invitations table with search and actions"
                bottomContentPlacement="outside"
                checkboxesProps={{
                    classNames: {
                        wrapper: "after:bg-foreground after:text-background text-background",
                    },
                }}
                classNames={classNames}
                selectedKeys={selectedKeys}
                selectionMode="multiple"
                sortDescriptor={{
                    column: sortDescriptor.column as string || "",
                    direction: sortDescriptor.direction as SortDirection || "ascending"
                }}
                topContent={topContent}
                topContentPlacement="outside"
                onSelectionChange={handleSelectionChange as any}
                onSortChange={handleSortChange as any}
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn
                            key={column.uid}
                            align={column.uid === "actions" ? "center" : "start"}
                            allowsSorting={column.sortable}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody
                    emptyContent={"No invitations found"}
                    items={isLoading ? [] : filteredInvitations as any}
                    isLoading={isLoading}
                    loadingContent={<Spinner />}
                >
                    {(item: CompanyInvitation) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey as string)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">Invite a new member</ModalHeader>
                    <ModalBody>
                        <InviteMemberForm onSubmit={handleInvite} isSubmitting={isInviting} />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
} 