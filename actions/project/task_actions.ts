import { ActionResult } from "@/types";
import { prisma } from "@/lib/prisma";
import { verifyProjectAccess } from "./actions";
import { Priority, Task } from "@prisma/client";
import { TaskStatus } from "@prisma/client";

export type TaskFilters = {
    page?: number;
    perPage?: number;
    status?: TaskStatus;
    priority?: Priority;
    dueDateRange?: {
        startDate: Date;
        endDate: Date;
    };
    name?: string;
}

export async function getTasksAction(projectId: string, userId: string, filters: TaskFilters = {
    page: 1,
    perPage: 10,
    status: undefined,
    priority: undefined,
    dueDateRange: undefined,
}): Promise<ActionResult<{
    data: Task[];
    totalTasks: number;
    totalPages: number;
}>> {
    try {
        // Verify project access
        const hasAccess = await verifyProjectAccess(projectId, userId);
        if (!hasAccess) {
            return { success: false, error: "You do not have access to this project" };
        }

        // Build where clause dynamically
        const where: any = {
            projectId: projectId,
            assigneeId: userId,
        };

        // Add optional filters if they are defined
        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.priority) {
            where.priority = filters.priority;
        }

        if (filters.dueDateRange?.startDate && filters.dueDateRange?.endDate) {
            where.dueDate = {
                gte: filters.dueDateRange.startDate,
                lte: filters.dueDateRange.endDate,
            };
        }

        if (filters.name) {
            where.name = {
                contains: filters.name,
            };
        }

        // Default pagination values
        const page = filters.page ?? 1;
        const perPage = filters.perPage ?? 10;

        // Get tasks
        const tasks = await prisma.task.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                assignee: true,
                comments: true,
                subtasks: true,
                parentTask: true,
                project: true,
            },
            skip: (page - 1) * perPage,
            take: perPage,
        });

        const totalTasks = await prisma.task.count({
            where,
        });

        const totalPages = Math.ceil(totalTasks / perPage);

        // Return tasks
        return { success: true, data: tasks, totalTasks, totalPages };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to get tasks" };
    }
}