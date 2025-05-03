"use client";

import React from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Textarea,
    Select,
    SelectItem,
    DatePicker,
    Chip,
    Spinner,
    Avatar,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema, ProjectStatus, Priority, CreateTaskSchema } from "@/types/forms";
import { projectStatusColorMap, priorityColorMap } from "@/types/project";
import { CalendarDate } from "@internationalized/date";
import { TaskStatus } from "@prisma/client";
import { useUserStore } from "@/lib/store/userStore";
import { useQuery } from "@tanstack/react-query";
import { getProjectMembersAction } from "@/actions/project/actions";

// Use the inferred type from Zod schema
type FormValues = CreateTaskSchema;

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormValues) => void;
    projectId: string;
}

export function CreateTaskModal({ isOpen, onClose, onSubmit, projectId }: CreateTaskModalProps) {
    const { user } = useUserStore();

    const { data: members, isLoading } = useQuery({
        queryKey: ["project-members", projectId, user?.id],
        queryFn: () => getProjectMembersAction(projectId, user?.id as string),
    });

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormValues>({
        resolver: zodResolver(createTaskSchema) as any, // Cast to any to avoid TypeScript errors
        defaultValues: {
            name: "",
            content: "",
            status: TaskStatus.NOT_STARTED,
            priority: Priority.LOW,
            dueDate: null,
            projectId: "",
        }
    });

    // Update projectId in form when projectId changes
    React.useEffect(() => {
        if (projectId) {
            reset(values => ({
                ...values,
                projectId: projectId
            }));
        }
    }, [projectId, reset]);

    const handleClose = () => {
        reset();
        onClose();
    };

    const onFormSubmit = async (data: FormValues) => {
        try {
            await onSubmit(data)
        } catch (error) {
            console.error("Error creating project:", error);
        } finally {
            handleClose();
        }
    };

    // Function to render status chip
    const renderStatusChip = (status: ProjectStatus) => (
        <Chip
            className="capitalize border-none gap-1 text-default-600"
            color={projectStatusColorMap[status]}
            size="sm"
            variant="dot"
        >
            {status.replace("_", " ").toLowerCase()}
        </Chip>
    );

    // Function to render priority chip
    const renderPriorityChip = (priority: Priority) => (
        <Chip
            className="capitalize border-none gap-1 text-default-600"
            color={priorityColorMap[priority]}
            size="sm"
            variant="flat"
        >
            {priority.toLowerCase()}
        </Chip>
    );

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="lg">
            <ModalContent>
                {
                    isLoading ? (
                        <div className="flex justify-center items-center h-full py-12">
                            <Spinner />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onFormSubmit as any)}>
                            <ModalHeader className="flex flex-col gap-1">
                                <h3 className="text-xl font-semibold">Create New Task</h3>
                                <p className="text-sm text-default-500">
                                    Create a new task to organize your work.
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Task Name"
                                                placeholder="Enter task name"
                                                isRequired
                                                errorMessage={errors.name?.message}
                                                isInvalid={!!errors.name}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="content"
                                        control={control}
                                        render={({ field }) => (
                                            <Textarea
                                                {...field}
                                                label="Description"
                                                placeholder="Enter task content"
                                                errorMessage={errors.content?.message}
                                                isInvalid={!!errors.content}
                                            />
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Controller
                                            name="status"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    label="Status"
                                                    placeholder="Select status"
                                                    selectedKeys={field.value ? [field.value] : []}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    errorMessage={errors.status?.message}
                                                    isInvalid={!!errors.status}
                                                    classNames={{
                                                        trigger: "h-12",
                                                    }}
                                                    renderValue={(items) => {
                                                        return items.map((item) => (
                                                            <div key={item.key} className="flex items-center gap-2">
                                                                {renderStatusChip(item.key as ProjectStatus)}
                                                            </div>
                                                        ));
                                                    }}
                                                >
                                                    {Object.values(ProjectStatus).map((status) => (
                                                        <SelectItem
                                                            key={status}
                                                            className="capitalize"
                                                            textValue={status.replace("_", " ")}
                                                            startContent={renderStatusChip(status)}
                                                        />
                                                    ))}
                                                </Select>
                                            )}
                                        />

                                        <Controller
                                            name="priority"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    label="Priority"
                                                    placeholder="Select priority"
                                                    selectedKeys={field.value ? [field.value] : []}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    errorMessage={errors.priority?.message}
                                                    isInvalid={!!errors.priority}
                                                    classNames={{
                                                        trigger: "h-12",
                                                    }}
                                                    renderValue={(items) => {
                                                        return items.map((item) => (
                                                            <div key={item.key} className="flex items-center gap-2">
                                                                {renderPriorityChip(item.key as Priority)}
                                                            </div>
                                                        ));
                                                    }}
                                                >
                                                    {Object.values(Priority).map((priority) => (
                                                        <SelectItem
                                                            key={priority}
                                                            textValue={priority}
                                                            startContent={renderPriorityChip(priority)}
                                                        />
                                                    ))}
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    <Controller
                                        name="dueDate"
                                        control={control}
                                        render={({ field }) => (
                                            <DatePicker
                                                label="Due Date"
                                                showMonthAndYearPickers
                                                errorMessage={errors.dueDate?.message}
                                                isInvalid={!!errors.dueDate}
                                                // @ts-ignore
                                                value={field.value ? new CalendarDate(
                                                    field.value.getFullYear(),
                                                    field.value.getMonth() + 1,
                                                    field.value.getDate()
                                                ) : undefined}
                                                onChange={(e) => {
                                                    if (e) {
                                                        field.onChange(new Date(e as any));
                                                    }
                                                }}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="estimatedTime"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                label="Estimated Time"
                                                placeholder="Enter estimated time"
                                                type="number"
                                                value={field.value?.toString() || ""}
                                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                                onBlur={field.onBlur}
                                                errorMessage={errors.estimatedTime?.message}
                                                isInvalid={!!errors.estimatedTime}
                                                startContent={
                                                    <div className="pointer-events-none flex items-center">
                                                        <span className="text-default-400 text-small">min</span>
                                                    </div>
                                                }
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="assignee"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                classNames={{
                                                    trigger: "h-12",
                                                }}
                                                selectedKeys={field.value ? [field.value] : []}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                onBlur={field.onBlur}
                                                errorMessage={errors.assignee?.message}
                                                isInvalid={!!errors.assignee}
                                                items={members?.success ? members.members : []}
                                                label="Assigned to"
                                                placeholder="Select a user"
                                            >
                                                {(user) => (
                                                    <SelectItem key={user.userId} textValue={user.user.email}>
                                                        <div className="flex gap-2 items-center">
                                                            <Avatar alt={user.user.username} className="flex-shrink-0" size="sm" src={user.user.avatar} />
                                                            <div className="flex flex-col">
                                                                <span className="text-small">{user.user.username}</span>
                                                                <span className="text-tiny text-default-400">{user.user.email}</span>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                )}
                                            </Select>
                                        )}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="flat" onPress={handleClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" type="submit" isLoading={isSubmitting}>
                                    Create Task
                                </Button>
                            </ModalFooter>
                        </form>
                    )
                }
            </ModalContent>
        </Modal>
    );
}