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
    Spinner
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProjectSchema, ProjectStatus, Priority } from "@/types/forms";
import { z } from "zod";
import { useCompanies, useProjects } from "@/lib/hooks";
import { projectStatusColorMap, priorityColorMap } from "@/types/project";
import { CalendarDate } from "@internationalized/date";

// Use the inferred type from Zod schema
type FormValues = z.infer<typeof updateProjectSchema>;

interface EditProjectModalProps {
    projectId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormValues) => void;
}

export function EditProjectModal({ projectId, isOpen, onClose, onSubmit }: EditProjectModalProps) {
    const { selectedCompanyId } = useCompanies();
    const { getProject } = useProjects();
    const [isLoading, setIsLoading] = React.useState(false);
    const [projectNotFound, setProjectNotFound] = React.useState(false);
    const hasLoadedRef = React.useRef<string | null>(null);
    
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormValues>({
        resolver: zodResolver(updateProjectSchema) as any,
        defaultValues: {
            id: '',
            name: "",
            description: "",
            status: undefined,
            priority: undefined,
            dueDate: null,
            budget: null,
            isPublic: false,
            companyId: selectedCompanyId || "",
        }
    });

    // Reset loaded state when modal closes
    React.useEffect(() => {
        if (!isOpen) {
            hasLoadedRef.current = null;
        }
    }, [isOpen]);

    // Fetch project data when modal opens
    React.useEffect(() => {
        // Define fetchProject outside to avoid recreating it on every render
        if (isOpen && projectId && hasLoadedRef.current !== projectId) {
            const fetchProjectData = async () => {
                setIsLoading(true);
                setProjectNotFound(false);
                hasLoadedRef.current = projectId;
                
                try {
                    const result = await getProject(projectId);
                    
                    if (result.success && result.project) {
                        // Format date properly
                        const project = result.project;
                        const formattedProject = {
                            ...project,
                            dueDate: project.dueDate ? new Date(project.dueDate) : null
                        };
                        
                        reset({
                            id: projectId,
                            name: formattedProject.name,
                            description: formattedProject.description || "",
                            status: formattedProject.status,
                            priority: formattedProject.priority,
                            dueDate: formattedProject.dueDate,
                            budget: formattedProject.budget,
                            isPublic: formattedProject.isPublic,
                            companyId: formattedProject.companyId,
                        });
                    } else {
                        setProjectNotFound(true);
                        addToast({
                            title: "Error",
                            description: result.error || "Project not found",
                            color: "danger",
                        });
                    }
                } catch (error) {
                    console.error("Error fetching project:", error);
                    setProjectNotFound(true);
                    addToast({
                        title: "Error",
                        description: "Failed to load project details",
                        color: "danger",
                    });
                } finally {
                    setIsLoading(false);
                }
            };
            
            fetchProjectData();
        }
    }, [isOpen, projectId, getProject, reset]);

    const handleClose = () => {
        reset();
        onClose();
    };

    const onFormSubmit = async (data: FormValues) => {
        try {
            await onSubmit(data);
        } catch (error) {
            console.error("Error updating project:", error);
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
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Spinner size="lg" />
                        <p className="mt-4 text-default-500">Loading project details...</p>
                    </div>
                ) : projectNotFound ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-danger">Project not found</p>
                        <Button className="mt-4" onPress={handleClose}>Close</Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onFormSubmit as any)}>
                        <ModalHeader className="flex flex-col gap-1">
                            <h3 className="text-xl font-semibold">Edit Project</h3>
                            <p className="text-sm text-default-500">
                                Update project details
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
                                                field.onChange(new Date(e ?? ""));
                                            }}
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
                                Update Project
                            </Button>
                        </ModalFooter>
                    </form>
                )}
            </ModalContent>
        </Modal>
    );
} 