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
    Pagination,
    Spinner,
    Select,
    SelectItem
} from "@heroui/react";
import { SortDirection } from "@react-types/shared";
import { MoreVertical, Search, ChevronDown, Plus, Calendar, Briefcase, Users } from "lucide-react";
import { formatDistanceToNow, isPast, isToday } from 'date-fns';
import { useProjects, useTable } from "@/lib/hooks";
import { Project } from "@/types/project";
import { projectStatusColorMap, priorityColorMap } from "@/types/project";
import { ProjectStatus } from "@/types/forms";
import { useRouter } from "next/navigation";
import { CreateProjectModal } from "./create-project-modal";
import { EditProjectModal } from "./edit-project-modal";

// Define columns for the project table
const columns = [
    { name: "NAME", uid: "name", sortable: true },
    { name: "STATUS", uid: "status", sortable: true },
    { name: "PRIORITY", uid: "priority", sortable: true },
    { name: "DUE DATE", uid: "dueDate", sortable: true },
    { name: "TASKS", uid: "tasksCount", sortable: true },
    { name: "MEMBERS", uid: "membersCount", sortable: true },
    { name: "ACTIONS", uid: "actions" },
];

// Status options for filtering
const statusOptions = [
    { name: "Not Started", uid: "NOT_STARTED" },
    { name: "In Progress", uid: "IN_PROGRESS" },
    { name: "Stopped", uid: "STOPPED" },
    { name: "Completed", uid: "COMPLETED" },
    { name: "Archived", uid: "ARCHIVED" },
];

// Rows per page options
const rowsPerPageOptions = [
    { label: "5", value: 5 },
    { label: "10", value: 10 },
    { label: "15", value: 15 },
    { label: "25", value: 25 },
];

// Helper function to capitalize strings
function capitalize(s: string) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

// Status dropdown'u için bir component oluşturalım
const renderStatusDropdown = (status: ProjectStatus | undefined, handleStatusFilter: (status: ProjectStatus | undefined) => void) => {
    // Tüm dropdown öğelerini bir array olarak oluştur
    const dropdownItems = [
        <DropdownItem 
            key="all" 
            className="capitalize" 
            onPress={() => handleStatusFilter(undefined)}
        >
            All
        </DropdownItem>,
        ...statusOptions.map((statusOption) => (
            <DropdownItem
                key={statusOption.uid}
                className="capitalize"
                onPress={() => handleStatusFilter(statusOption.uid as ProjectStatus)}
            >
                {capitalize(statusOption.name)}
            </DropdownItem>
        ))
    ];

    return (
        <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
                <Button
                    endContent={<ChevronDown className="text-small" size={16} />}
                    size="sm"
                    variant="flat"
                >
                    Status
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                disallowEmptySelection
                aria-label="Status Filter"
                closeOnSelect={true}
                selectedKeys={status ? new Set([status]) : new Set([])}
                selectionMode="single"
                onSelectionChange={(keys) => {
                    if (keys === "all") return;
                    const selected = Array.from(keys)[0] as ProjectStatus;
                    handleStatusFilter(selected);
                }}
            >
                {dropdownItems}
            </DropdownMenu>
        </Dropdown>
    );
};

export default function ProjectsTable() {
    const router = useRouter();
    const [mounted, setMounted] = React.useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);

    // Fetch projects data using our custom hook
    const {
        projects,
        totalProjects,
        totalPages,
        page,
        perPage,
        search,
        status,
        sortBy,
        sortDirection,
        handleSearch,
        handleStatusFilter,
        handleSortChange,
        handlePageChange,
        handlePerPageChange,
        isLoading,
        isError,
        error,
        createProject,
        updateProject
    } = useProjects();

    // Use table hook for the UI state of the table
    const {
        selectedKeys,
        handleSelectionChange,
        setVisibleColumns
    } = useTable<Project>({
        columns,
        onSearchChange: handleSearch,
        onSortChange: descriptor => handleSortChange({
            column: descriptor.column as string,
            direction: descriptor.direction === 'ascending' ? 'ascending' : 'descending'
        }),
        onPageChange: handlePageChange,
        onRowsPerPageChange: handlePerPageChange,
        filterField: 'name'
    });

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const renderCell = React.useCallback((project: Project, columnKey: string) => {
        switch (columnKey) {
            case "name":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-small capitalize">{project.name}</p>
                        {project.description && (
                            <p className="text-bold text-tiny text-default-500 truncate max-w-xs">
                                {project.description}
                            </p>
                        )}
                    </div>
                );
            case "status":
                return (
                    <Chip
                        className="capitalize border-none gap-1 text-default-600"
                        color={projectStatusColorMap[project.status]}
                        size="sm"
                        variant="dot"
                    >
                        {project.status.replace("_", " ").toLowerCase()}
                    </Chip>
                );
            case "priority":
                return (
                    <Chip
                        className="capitalize border-none gap-1 text-default-600"
                        color={priorityColorMap[project.priority]}
                        size="sm"
                        variant="flat"
                    >
                        {project.priority.toLowerCase()}
                    </Chip>
                );
            case "dueDate":
                if (!project.dueDate) return <span className="text-default-400">Not set</span>;

                const dueDate = new Date(project.dueDate);
                const isPastDue = isPast(dueDate) && !isToday(dueDate);

                return (
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className={isPastDue ? "text-danger" : "text-default-400"} />
                        <span className={isPastDue ? "text-danger font-medium" : ""}>
                            {isToday(dueDate)
                                ? "Today"
                                : formatDistanceToNow(dueDate, { addSuffix: true })}
                        </span>
                    </div>
                );
            case "tasksCount":
                return (
                    <div className="flex items-center gap-2">
                        <Briefcase size={16} className="text-default-400" />
                        <span>{project.tasksCount}</span>
                    </div>
                );
            case "membersCount":
                return (
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-default-400" />
                        <span>{project.membersCount}</span>
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
                                <DropdownItem
                                    key="view"
                                    onPress={() => router.push(`/dashboard/projects/${project.id}`)}
                                >
                                    View
                                </DropdownItem>
                                <DropdownItem
                                    key="edit"
                                    onPress={() => {
                                        setSelectedProjectId(project.id);
                                        setIsEditModalOpen(true);
                                    }}
                                >
                                    Edit
                                </DropdownItem>
                                <DropdownItem
                                    key="delete"
                                    className="text-danger"
                                    color="danger"
                                >
                                    Delete
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                );
            default:
                return project[columnKey as keyof Project];
        }
    }, [router]);

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
                        placeholder="Search projects..."
                        size="sm"
                        startContent={<Search className="text-default-300" size={18} />}
                        value={search}
                        variant="bordered"
                        onClear={() => handleSearch("")}
                        onValueChange={handleSearch}
                    />
                    <div className="flex gap-3">
                        {renderStatusDropdown(status, handleStatusFilter)}
                        <Button
                            className="bg-foreground text-background"
                            endContent={<Plus size={16} />}
                            size="sm"
                            onPress={() => setIsCreateModalOpen(true)}
                        >
                            New Project
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {totalProjects} projects</span>
                    <div className="flex items-center gap-2">
                        <span className="text-default-400 text-small">Rows per page:</span>
                        <Select
                            size="sm"
                            className="min-w-[70px] w-[70px]"
                            classNames={{
                                trigger: "h-8 min-h-[32px]",
                                value: "text-small",
                            }}
                            selectedKeys={[perPage.toString()]}
                            onChange={(e) => handlePerPageChange(Number(e.target.value))}
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
        search,
        status,
        handleSearch,
        handleStatusFilter,
        totalProjects,
        perPage,
        handlePerPageChange,
    ]);

    const bottomContent = React.useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <Pagination
                    showControls
                    classNames={{
                        cursor: "bg-foreground text-background",
                    }}
                    color="default"
                    isDisabled={isLoading}
                    page={page}
                    total={totalPages}
                    variant="light"
                    onChange={handlePageChange}
                />
                <span className="text-small text-default-400">
                    {selectedKeys === "all"
                        ? "All items selected"
                        : `${(selectedKeys as Set<string>).size} of ${projects.length} selected`}
                </span>
            </div>
        );
    }, [selectedKeys, projects.length, page, totalPages, isLoading, handlePageChange]);

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
                <p className="text-danger text-center">Error loading projects: {error}</p>
                <Button color="primary" onPress={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    return (
        <>
            <Table
                isCompact
                removeWrapper
                aria-label="Projects table with sorting, pagination and search"
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
                    column: sortBy,
                    direction: sortDirection as SortDirection,
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
                    emptyContent={"No projects found"}
                    items={isLoading ? [] : projects as any}
                    isLoading={isLoading}
                    loadingContent={<Spinner />}
                >
                    {(item: Project) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey as string)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

                <CreateProjectModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={createProject}
                />

                <EditProjectModal 
                    projectId={selectedProjectId}
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedProjectId(null);
                    }}
                    onSubmit={(data) => updateProject(data)}
                />
        </>
    );
}

