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
    Avatar,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Select,
    SelectItem,
    Card,
    CardHeader,
    CardBody,
    Divider,
    Pagination
} from "@heroui/react";
import { MoreVertical, Search, CalendarClock, UserCog, ChevronDown } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useMembers, useTable } from "@/lib/hooks";
import { CompanyMember } from "@/lib/store/memberStore";
import { companyMemberColorMap } from "@/types/members";
import { CompanyMemberRole } from "@/types/forms";

// Define color type to match HeroUI Chip component requirements
type ChipColorType = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined;

// Define columns for the member table
const columns = [
    { name: "USER", uid: "user", sortable: true },
    { name: "ROLE", uid: "role", sortable: true },
    { name: "JOINED", uid: "createdAt", sortable: true },
    { name: "ACTIONS", uid: "actions" },
];

// Role options for filtering
const roleOptions = [
    { name: "All", uid: "all" },
    { name: "Owner", uid: "OWNER" },
    { name: "Admin", uid: "ADMIN" },
    { name: "Member", uid: "MEMBER" },
];

// Rows per page options
const rowsPerPageOptions = [
    { label: "5", value: 5 },
    { label: "10", value: 10 },
    { label: "15", value: 15 },
    { label: "25", value: 25 },
];

export default function MembersTable() {
    const [mounted, setMounted] = React.useState(false);
    const [filterValue, setFilterValue] = React.useState("");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedMember, setSelectedMember] = React.useState<CompanyMember | null>(null);
    const [selectedRole, setSelectedRole] = React.useState<CompanyMemberRole | "">("");
    const [roleFilter, setRoleFilter] = React.useState<CompanyMemberRole | "all">("all");
    const [page, setPage] = React.useState(1);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

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
        filterField: 'user.email' as keyof CompanyMember
    });

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Reset selected role when modal opens with a member
    React.useEffect(() => {
        if (selectedMember) {
            setSelectedRole(selectedMember.role);
        }
    }, [selectedMember]);

    // Filter members based on search input and role filter
    const filteredMembers = React.useMemo(() => {
        let filtered = members;

        if (filterValue.trim()) {
            filtered = filtered.filter(member => 
                member.user.email.toLowerCase().includes(filterValue.toLowerCase()) ||
                member.user.username.toLowerCase().includes(filterValue.toLowerCase())
            );
        }

        if (roleFilter !== "all") {
            filtered = filtered.filter(member => member.role === roleFilter);
        }

        return filtered;
    }, [members, filterValue, roleFilter]);

    // Pagination logic
    const pages = Math.ceil(filteredMembers.length / rowsPerPage) || 1;
    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredMembers.slice(start, end);
    }, [page, filteredMembers, rowsPerPage]);

    const handleSearch = (value: string) => {
        setFilterValue(value);
        setPage(1);
    };

    const handleRoleFilter = (role: CompanyMemberRole | "all") => {
        setRoleFilter(role);
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (value: number) => {
        setRowsPerPage(value);
        setPage(1);
    };

    const handleOpenUpdateModal = (member: CompanyMember) => {
        setSelectedMember(member);
        onOpen();
    };
    
    const handleCloseUpdateModal = () => {
        setSelectedMember(null);
        setSelectedRole("");
        onClose();
    };
    
    const handleUpdateRole = async () => {
        if (selectedMember && selectedRole) {
            await updateMemberRole(selectedMember.id, selectedRole as CompanyMemberRole);
            handleCloseUpdateModal();
        }
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
                                    key="update"
                                    onPress={() => handleOpenUpdateModal(member)}
                                >
                                    Update Role
                                </DropdownItem>
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
                    <div className="flex gap-3 flex-1">
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
                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    endContent={<ChevronDown className="text-small" size={16} />}
                                    size="sm"
                                    variant="flat"
                                >
                                    Role
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Role Filter"
                                closeOnSelect={true}
                                selectedKeys={new Set([roleFilter])}
                                selectionMode="single"
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as CompanyMemberRole | "all";
                                    handleRoleFilter(selected);
                                }}
                            >
                                {roleOptions.map((role) => (
                                    <DropdownItem key={role.uid}>
                                        {role.name}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {filteredMembers.length} members</span>
                    <div className="flex items-center gap-2">
                        <span className="text-default-400 text-small">Rows per page:</span>
                        <Select
                            size="sm"
                            className="min-w-[70px] w-[70px]"
                            classNames={{
                                trigger: "h-8 min-h-[32px]",
                                value: "text-small",
                            }}
                            selectedKeys={[rowsPerPage.toString()]}
                            onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                            aria-label="Rows per page"
                        >
                            {rowsPerPageOptions.map((option) => (
                                <SelectItem key={option.value.toString()}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                </div>
            </div>
        );
    }, [
        filterValue,
        roleFilter,
        handleSearch,
        handleRoleFilter,
        filteredMembers.length,
        rowsPerPage,
        handleRowsPerPageChange,
    ]);

    const bottomContent = React.useMemo(() => {
        return (
            <div className="flex flex-col items-center justify-between gap-2 px-2 py-2 sm:flex-row">
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    isDisabled={isLoading}
                    page={page}
                    total={pages}
                    onChange={handlePageChange}
                />
                <div className="flex items-center justify-end gap-6">
                    <span className="text-small text-default-400">
                        {selectedKeys === "all"
                            ? "All items selected"
                            : `${(selectedKeys as Set<string>).size} of ${filteredMembers.length} selected`}
                    </span>
                    <div className="flex items-center gap-3">
                        <Button isDisabled={page === 1} size="sm" variant="flat" onPress={() => handlePageChange(page - 1)}>
                            Previous
                        </Button>
                        <Button isDisabled={page === pages} size="sm" variant="flat" onPress={() => handlePageChange(page + 1)}>
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        );
    }, [selectedKeys, filteredMembers.length, page, pages, isLoading, handlePageChange]);

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
                bottomContent={bottomContent}
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
                    items={isLoading ? [] : items as any}
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

            {/* Update Role Modal */}
            <Modal isOpen={isOpen} onClose={handleCloseUpdateModal}>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <h3 className="text-xl font-semibold">Update Member Role</h3>
                        <p className="text-sm text-default-500">
                            Assign a new role to this member
                        </p>
                    </ModalHeader>
                    <ModalBody>
                        {selectedMember && (
                            <>
                                <Card className="bg-content2/40 border border-content3/40 shadow-sm">
                                    <CardHeader className="p-3 flex-row items-center justify-between gap-2">
                                        <User
                                            name={selectedMember.user.username}
                                            description={selectedMember.user.email}
                                            avatarProps={{
                                                src: selectedMember.user.avatar || undefined,
                                                showFallback: true,
                                                size: "lg",
                                                fallback: <Avatar name={selectedMember.user.username} size="lg" radius="lg" />
                                            }}
                                            classNames={{
                                                name: "text-foreground font-semibold",
                                                description: "text-foreground-500"
                                            }}
                                        />
                                        <Chip
                                            className="capitalize border-none gap-1"
                                            color={companyMemberColorMap[selectedMember.role] as ChipColorType}
                                            size="sm"
                                            variant="dot"
                                        >
                                            {selectedMember.role.toLowerCase()}
                                        </Chip>
                                    </CardHeader>
                                    <Divider />
                                    <CardBody className="p-3 pt-2">
                                        <div className="flex gap-2 items-center">
                                            <CalendarClock size={16} className="text-primary/70" />
                                            <span className="text-small text-foreground-500">
                                                Joined {formatDistanceToNow(new Date(selectedMember.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </CardBody>
                                </Card>

                                <Divider className="my-2" />

                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <UserCog size={18} className="text-default-500" />
                                        <p className="text-small font-medium">Select a new role</p>
                                    </div>
                                    <Select
                                        label="Role"
                                        placeholder="Select role"
                                        selectedKeys={selectedRole ? [selectedRole] : []}
                                        onChange={(e) => setSelectedRole(e.target.value as CompanyMemberRole)}
                                        classNames={{
                                            trigger: "h-12",
                                        }}
                                        renderValue={(items) => {
                                            return items.map((item) => (
                                                <div key={item.key} className="flex items-center gap-2">
                                                    <Chip
                                                        className="capitalize border-none gap-1 text-default-600"
                                                        color={companyMemberColorMap[item.key as CompanyMemberRole] as ChipColorType}
                                                        size="sm"
                                                        variant="dot"
                                                    >
                                                        {String(item.key).toLowerCase()}
                                                    </Chip>
                                                </div>
                                            ));
                                        }}
                                    >
                                        {Object.values(CompanyMemberRole).map((role) => (
                                            <SelectItem 
                                                key={role} 
                                                className="capitalize"
                                                textValue={role.toLowerCase()}
                                                startContent={
                                                    <Chip
                                                        className="capitalize border-none gap-1 text-default-600"
                                                        color={companyMemberColorMap[role] as ChipColorType}
                                                        size="sm"
                                                        variant="dot"
                                                    >
                                                        {role.toLowerCase()}
                                                    </Chip>
                                                }
                                            />
                                        ))}
                                    </Select>
                                </div>
                            </>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" onPress={handleCloseUpdateModal}>
                            Cancel
                        </Button>
                        <Button 
                            color="primary" 
                            onPress={handleUpdateRole}
                            isDisabled={!selectedRole || selectedMember?.role === selectedRole}
                        >
                            Update Role
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
} 