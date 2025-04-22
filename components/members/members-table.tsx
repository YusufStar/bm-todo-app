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
    User,
    Avatar
} from "@heroui/react";
import { MoreVertical, Search, CalendarClock } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useMembers, useTable } from "@/lib/hooks";
import { CompanyMember } from "@/lib/store/memberStore";
import { companyMemberColorMap } from "@/types/members";
import { CompanyMemberRole } from "@/types/forms";
import { useRouter } from "next/navigation";

// Define color type to match HeroUI Chip component requirements
type ChipColorType = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined;

// Define columns for the member table
const columns = [
    { name: "USER", uid: "user", sortable: true },
    { name: "ROLE", uid: "role", sortable: true },
    { name: "JOINED", uid: "createdAt", sortable: true },
    { name: "ACTIONS", uid: "actions" },
];

export default function MembersTable() {
    const [mounted, setMounted] = React.useState(false);
    const [filterValue, setFilterValue] = React.useState("");

    // Fetch members data using our custom hook
    const {
        members,
        isLoading,
        isError,
        error,
        updateMemberRole,
        removeMember,
        refetch
    } = useMembers();

    // Use table hook for the UI state of the table
    const {
        selectedKeys,
        handleSelectionChange,
        sortDescriptor,
        handleSortChange
    } = useTable<CompanyMember>({
        columns,
        onSortChange: (descriptor) => {
            handleSortChange(descriptor);
        },
        filterField: 'user.email' as keyof CompanyMember
    });

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Filter members based on search input
    const filteredMembers = React.useMemo(() => {
        if (!filterValue.trim()) return members;

        return members.filter(member => 
            member.user.email.toLowerCase().includes(filterValue.toLowerCase()) ||
            member.user.username.toLowerCase().includes(filterValue.toLowerCase())
        );
    }, [members, filterValue]);

    const handleSearch = (value: string) => {
        setFilterValue(value);
    };

    const renderCell = React.useCallback((member: CompanyMember, columnKey: string): React.ReactNode => {
        switch (columnKey) {
            case "user":
                return (
                    <User
                        name={member.user.username}
                        description={member.user.email}
                        avatarProps={{
                            src: member.user.avatar || undefined,
                            showFallback: true,
                            fallback: <Avatar name={member.user.username} />
                        }}
                    />
                );
            case "role":
                return (
                    <Chip
                        className="capitalize border-none gap-1 text-default-600"
                        color={companyMemberColorMap[member.role] as ChipColorType}
                        size="sm"
                        variant="dot"
                    >
                        {member.role.toLowerCase()}
                    </Chip>
                );
            case "createdAt":
                return (
                    <div className="flex items-center gap-2">
                        <CalendarClock size={16} className="text-default-400" />
                        <span>
                            {formatDistanceToNow(new Date(member.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                );
            case "actions":
                return (
                    <div className="relative flex justify-end items-center gap-2">
                        <Dropdown className="bg-background border-1 border-default-200">
                            <DropdownTrigger>
                                <Button isIconOnly radius="full" size="sm" variant="light">
                                    <MoreVertical className="text-default-400" size={18} />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                                <DropdownItem key="role" isDisabled>Manage Role</DropdownItem>
                                <DropdownItem
                                    key="role_owner"
                                    className="text-primary"
                                    onPress={() => updateMemberRole(member.id, CompanyMemberRole.OWNER)}
                                >
                                    Set as Owner
                                </DropdownItem>
                                <DropdownItem
                                    key="role_admin"
                                    className="text-secondary"
                                    onPress={() => updateMemberRole(member.id, CompanyMemberRole.ADMIN)}
                                >
                                    Set as Admin
                                </DropdownItem>
                                <DropdownItem
                                    key="role_member"
                                    onPress={() => updateMemberRole(member.id, CompanyMemberRole.MEMBER)}
                                >
                                    Set as Member
                                </DropdownItem>
                                <DropdownItem key="divider" isDisabled className="h-px bg-default-200 my-1" />
                                <DropdownItem
                                    key="remove"
                                    className="text-danger"
                                    color="danger"
                                    onPress={() => removeMember(member.id)}
                                >
                                    Remove Member
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                );
            default:
                const value = member[columnKey as keyof CompanyMember];
                return typeof value === 'object' && value !== null 
                    ? JSON.stringify(value) 
                    : String(value);
        }
    }, [updateMemberRole, removeMember]);

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
                        placeholder="Search by email or username..."
                        size="sm"
                        startContent={<Search className="text-default-300" size={18} />}
                        value={filterValue}
                        variant="bordered"
                        onClear={() => handleSearch("")}
                        onValueChange={handleSearch}
                    />
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {filteredMembers.length} members</span>
                </div>
            </div>
        );
    }, [
        filterValue,
        handleSearch,
        filteredMembers.length
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
                <p className="text-danger text-center">Error loading members: {error}</p>
                <Button color="primary" onPress={() => refetch()}>Retry</Button>
            </div>
        );
    }

    return (
        <>
            <Table
                isCompact
                removeWrapper
                aria-label="Members table with search and actions"
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
                    direction: sortDescriptor.direction || "ascending"
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
                    emptyContent={"No members found"}
                    items={isLoading ? [] : filteredMembers as any}
                    isLoading={isLoading}
                    loadingContent={<Spinner />}
                >
                    {(item: CompanyMember) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey as string)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </>
    );
} 