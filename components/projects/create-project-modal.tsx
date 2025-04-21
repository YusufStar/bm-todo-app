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
    Checkbox,
    DatePicker,
    Chip,
    addToast,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema, ProjectStatus, Priority } from "@/types/forms";
import { z } from "zod";
import { useCompanies } from "@/lib/hooks";
import { projectStatusColorMap, priorityColorMap } from "@/types/project";

// Use the inferred type from Zod schema
type FormValues = z.infer<typeof createProjectSchema>;

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormValues) => void;
}

export function CreateProjectModal({ isOpen, onClose, onSubmit }: CreateProjectModalProps) {
    const { selectedCompanyId } = useCompanies();
    
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormValues>({
        resolver: zodResolver(createProjectSchema) as any, // Cast to any to avoid TypeScript errors
        defaultValues: {
            name: "",
            description: "",
            status: ProjectStatus.NOT_STARTED,
            priority: Priority.LOW,
            dueDate: null,
            budget: null,
            isPublic: false,
            companyId: selectedCompanyId || "",
        }
    });

    // Update companyId in form when selectedCompanyId changes
    React.useEffect(() => {
        if (selectedCompanyId) {
            reset(values => ({
                ...values,
                companyId: selectedCompanyId
            }));
        }
    }, [selectedCompanyId, reset]);

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
                {/* Use type assertion to avoid TypeScript errors with handleSubmit */}
                <form onSubmit={handleSubmit(onFormSubmit as any)}>
                    <ModalHeader className="flex flex-col gap-1">
                        <h3 className="text-xl font-semibold">Create New Project</h3>
                        <p className="text-sm text-default-500">
                            Create a new project to organize your work.
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
                                        label="Project Name"
                                        placeholder="Enter project name"
                                        isRequired
                                        errorMessage={errors.name?.message}
                                        isInvalid={!!errors.name}
                                    />
                                )}
                            />

                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        label="Description"
                                        placeholder="Enter project description"
                                        errorMessage={errors.description?.message}
                                        isInvalid={!!errors.description}
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
                                        errorMessage={errors.dueDate?.message}
                                        isInvalid={!!errors.dueDate}
                                        onChange={(e) => field.onChange(e)}
                                    />
                                )}
                            />

                            <Controller
                                name="budget"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        label="Budget"
                                        placeholder="Enter budget amount"
                                        type="number"
                                        value={field.value?.toString() || ""}
                                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                        onBlur={field.onBlur}
                                        errorMessage={errors.budget?.message}
                                        isInvalid={!!errors.budget}
                                        startContent={
                                            <div className="pointer-events-none flex items-center">
                                                <span className="text-default-400 text-small">$</span>
                                            </div>
                                        }
                                    />
                                )}
                            />

                            <Controller
                                name="isPublic"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        isSelected={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <span className="text-sm">
                                            Make this project visible to all company members
                                        </span>
                                    </Checkbox>
                                )}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" onPress={handleClose}>
                            Cancel
                        </Button>
                        <Button color="primary" type="submit" isLoading={isSubmitting}>
                            Create Project
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}