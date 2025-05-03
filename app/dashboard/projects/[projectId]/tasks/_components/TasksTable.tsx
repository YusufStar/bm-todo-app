"use client";

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
    SelectItem,
    DateRangePicker,
    useDisclosure
} from "@heroui/react";
import { RangeValue, SortDirection } from "@react-types/shared";
import { MoreVertical, Search, ChevronDown, Clock, Calendar, PlusCircle } from "lucide-react";
import { formatDistanceToNow, isPast, isToday } from 'date-fns';
import { getTasksAction, TaskFilters } from "@/actions/project/task_actions";
import { Priority, Task, TaskStatus } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { DateValue } from "@internationalized/date";
import { CreateTaskModal } from "@/components/projects/create-task-modal";
import { CreateTaskSchema } from "@/types/forms";

// Define color type to match HeroUI Chip component requirements
type ChipColorType = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined;

// Define columns for the task table
const columns = [
    { name: "NAME", uid: "name", sortable: true },
    { name: "STATUS", uid: "status", sortable: true },
    { name: "PRIORITY", uid: "priority", sortable: true },
    { name: "DUE DATE", uid: "dueDate", sortable: true },
    { name: "EST. TIME", uid: "estimatedTime", sortable: true },
    { name: "SPENT TIME", uid: "spentTime", sortable: true },
    { name: "ACTIONS", uid: "actions" },
];

// Status options for filtering
const statusOptions = [
    { name: "All", uid: "all" },
    { name: "Not Started", uid: "NOT_STARTED" },
    { name: "In Progress", uid: "IN_PROGRESS" },
    { name: "Review", uid: "REVIEW" },
    { name: "Completed", uid: "COMPLETED" },
    { name: "Cancelled", uid: "CANCELLED" },
];

// Priority options for filtering
const priorityOptions = [
    { name: "All", uid: "all" },
    { name: "Low", uid: "LOW" },
    { name: "Medium", uid: "MEDIUM" },
    { name: "High", uid: "HIGH" },
];

// Rows per page options
const rowsPerPageOptions = [
    { label: "5", value: 5 },
    { label: "10", value: 10 },
    { label: "15", value: 15 },
    { label: "25", value: 25 },
];

// Status color mapping
const taskStatusColorMap: Record<TaskStatus, ChipColorType> = {
    NOT_STARTED: "default",
    IN_PROGRESS: "primary",
    REVIEW: "secondary",
    COMPLETED: "success",
    CANCELLED: "danger",
};

// Priority color mapping
const priorityColorMap: Record<Priority, ChipColorType> = {
    LOW: "default",
    MEDIUM: "warning",
    HIGH: "danger",
};

// Format minutes to hours and minutes
function formatTime(minutes: number | null): string {
    if (!minutes) return "—";
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
        return `${mins}m`;
    } else if (mins === 0) {
        return `${hours}h`;
    } else {
        return `${hours}h ${mins}m`;
    }
}

export default function TasksTable({
    projectId,
    userId,
    tasks,
    totalTasks,
    totalPages,
}: {
    projectId: string;
    userId: string;
    tasks: Task[];
    totalTasks: number;
    totalPages: number;
}) {
    const router = useRouter();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [mounted, setMounted] = React.useState(false);
    const [filterValue, setFilterValue] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<TaskStatus | "all">("all");
    const [priorityFilter, setPriorityFilter] = React.useState<Priority | "all">("all");
    const [dateRange, setDateRange] = React.useState<RangeValue<DateValue> | null>(null);
    const [page, setPage] = React.useState(1);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [sortDescriptor, setSortDescriptor] = React.useState<{
        column?: string;
        direction?: SortDirection;
    }>({
        column: "dueDate",
        direction: "ascending"
    });

    // Convert filter state to Task Filter object
    const filters = React.useMemo<TaskFilters>(() => {
        const result: TaskFilters = {
            page,
            perPage: rowsPerPage,
            status: statusFilter !== "all" ? statusFilter : undefined,
            priority: priorityFilter !== "all" ? priorityFilter : undefined,
            name: filterValue,
        };

        if (dateRange && dateRange.start && dateRange.end) {
            result.dueDateRange = {
                startDate: dateRange.start.toDate("UTC"),
                endDate: dateRange.end.toDate("UTC"),
            };
        }

        return result;
    }, [page, rowsPerPage, statusFilter, priorityFilter, dateRange, filterValue]);

    // Fetch tasks with react-query
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["tasks", projectId, userId, filters],
        queryFn: async () => {
            const result = await getTasksAction(projectId, userId, filters);
            
            if (!result.success) {
                throw new Error(result.error);
            }

            return {
                tasks: result.data,
                totalTasks: result.totalTasks,
                totalPages: result.totalPages,
            };
        },
        initialData: {
            tasks,
            totalTasks,
            totalPages,
        },
    });

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Handle search
    const handleSearch = (value: string) => {
        setFilterValue(value);
        setPage(1);
    };

    // Handle status filter
    const handleStatusFilter = (status: TaskStatus | "all") => {
        setStatusFilter(status);
        setPage(1);
    };

    // Handle priority filter
    const handlePriorityFilter = (priority: Priority | "all") => {
        setPriorityFilter(priority);
        setPage(1);
    };

    // Handle date range filter
    const handleDateRangeChange = (value: RangeValue<DateValue> | null) => {
        setDateRange(value);
        setPage(1);
    };

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    // Handle rows per page change
    const handleRowsPerPageChange = (value: number) => {
        setRowsPerPage(value);
        setPage(1);
    };

    // Handle sort change
    const handleSortChange = (descriptor: { column?: string; direction?: SortDirection }) => {
        setSortDescriptor(descriptor);
    };

    // Handle view task details
    const handleViewTask = (taskId: string) => {
        router.push(`/dashboard/projects/${projectId}/tasks/${taskId}`);
    };

    // Render cell content based on column
    const renderCell = React.useCallback((task: Task, columnKey: string): React.ReactNode => {
        switch (columnKey) {
            case "name":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-small capitalize">{task.name}</p>
                        {task.content && (
                            <p className="text-bold text-tiny text-default-500 truncate max-w-xs">
                                {task.content.length > 50 ? task.content.substring(0, 50) + "..." : task.content}
                            </p>
                        )}
                    </div>
                );
            case "status":
                return (
                    <Chip
                        className="capitalize border-none gap-1 text-default-600"
                        color={taskStatusColorMap[task.status]}
                        size="sm"
                        variant="dot"
                    >
                        {task.status.replace("_", " ").toLowerCase()}
                    </Chip>
                );
            case "priority":
                return (
                    <Chip
                        className="capitalize border-none gap-1 text-default-600"
                        color={priorityColorMap[task.priority]}
                        size="sm"
                        variant="flat"
                    >
                        {task.priority.toLowerCase()}
                    </Chip>
                );
            case "dueDate":
                if (!task.dueDate) return <span className="text-default-400">Not set</span>;

                const dueDate = new Date(task.dueDate);
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
            case "estimatedTime":
                return (
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-default-400" />
                        <span>{formatTime(task.estimatedTime)}</span>
                    </div>
                );
            case "spentTime":
                return (
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-default-400" />
                        <span>{formatTime(task.spentTime)}</span>
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
                                    onPress={() => handleViewTask(task.id)}
                                >
                                    View Details
                                </DropdownItem>
                                <DropdownItem
                                    key="edit"
                                >
                                    Edit Task
                                </DropdownItem>
                                <DropdownItem
                                    key="delete"
                                    className="text-danger"
                                    color="danger"
                                >
                                    Delete Task
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                );
            default:
                const value = task[columnKey as keyof Task];
                return typeof value === 'object' && value !== null 
                    ? JSON.stringify(value) 
                    : String(value);
        }
    }, [projectId, router]);

    // Top content with search and filters
    const topContent = React.useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <div className="flex gap-3 flex-1 max-w-[66%]">
                        <Input
                            isClearable
                            classNames={{
                                base: "w-full sm:max-w-[44%]",
                                inputWrapper: "border-1",
                            }}
                            placeholder="Search tasks..."
                            size="sm"
                            startContent={<Search className="text-default-300" size={18} />}
                            value={filterValue}
                            variant="bordered"
                            onClear={() => handleSearch("")}
                            onValueChange={handleSearch}
                        />
                        <DateRangePicker
                            // @ts-ignore
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            size="sm"
                        />
                        <Dropdown>
                            <DropdownTrigger>
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
                                selectedKeys={new Set([statusFilter])}
                                selectionMode="single"
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as TaskStatus | "all";
                                    handleStatusFilter(selected);
                                }}
                            >
                                {statusOptions.map((status) => (
                                    <DropdownItem key={status.uid}>
                                        {status.name}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    endContent={<ChevronDown className="text-small" size={16} />}
                                    size="sm"
                                    variant="flat"
                                >
                                    Priority
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Priority Filter"
                                closeOnSelect={true}
                                selectedKeys={new Set([priorityFilter])}
                                selectionMode="single"
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as Priority | "all";
                                    handlePriorityFilter(selected);
                                }}
                            >
                                {priorityOptions.map((priority) => (
                                    <DropdownItem key={priority.uid}>
                                        {priority.name}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            className="bg-foreground text-background"
                            endContent={<PlusCircle size={16} />}
                            size="sm"
                            onPress={onOpen}
                        >
                            New Task
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {data.totalTasks} tasks</span>
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
        dateRange, 
        statusFilter, 
        priorityFilter, 
        handleSearch, 
        handleDateRangeChange, 
        handleStatusFilter, 
        handlePriorityFilter, 
        data.totalTasks, 
        rowsPerPage, 
        handleRowsPerPageChange
    ]);

    // Bottom content with pagination
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
                    total={data.totalPages}
                    onChange={handlePageChange}
                />
                <div className="flex items-center justify-end gap-6">
                    <div className="flex items-center gap-3">
                        <Button isDisabled={page === 1} size="sm" variant="flat" onPress={() => handlePageChange(page - 1)}>
                            Previous
                        </Button>
                        <Button isDisabled={page === data.totalPages} size="sm" variant="flat" onPress={() => handlePageChange(page + 1)}>
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        );
    }, [page, data.totalPages, isLoading, handlePageChange]);

    // Table classes
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
                <p className="text-danger text-center">Error loading tasks: {error instanceof Error ? error.message : "Unknown error"}</p>
                <Button color="primary" onPress={() => refetch()}>Retry</Button>
            </div>
        );
    }

    return (
        <>
            <Table
                isCompact
                removeWrapper
                aria-label="Tasks table with search and filters"
                bottomContent={bottomContent}
                bottomContentPlacement="outside"
                classNames={classNames}
                selectionMode="multiple"
                sortDescriptor={{
                    column: sortDescriptor.column || "",
                    direction: sortDescriptor.direction || "ascending"
                }}
                topContent={topContent}
                topContentPlacement="outside"
                onSortChange={(descriptor) => handleSortChange(descriptor as { column?: string; direction?: SortDirection })}
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
                    emptyContent={"No tasks found"}
                    items={isLoading ? [] : data.tasks as any}
                    isLoading={isLoading}
                    loadingContent={<Spinner />}
                >
                    {(item: Task) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey as string)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <CreateTaskModal projectId={projectId} isOpen={isOpen} onClose={onClose} onSubmit={(data: CreateTaskSchema) => {
                console.log("create task", data);
            }} />
        </>
    );
}