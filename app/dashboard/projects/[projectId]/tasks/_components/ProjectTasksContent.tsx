"use client";

import DashboardPageLayout from "@/components/layout/dashboard-page-layout";
import { Tab, Tabs } from "@heroui/react";
import TasksTable from "./TasksTable";
import { Task } from "@prisma/client";

export default function ProjectTasksContent({
    tasks,
    totalTasks,
    totalPages,
    projectId,
    userId,
}: {
    tasks: Task[];
    totalTasks: number;
    totalPages: number;
    projectId: string;
    userId: string;
}) {
    return (
        <DashboardPageLayout
            title="Tasks"
            subtitle="Tasks for the project"
        >
            <Tabs fullWidth>
                <Tab key="table" title="Table">
                    <TasksTable projectId={projectId} userId={userId} tasks={tasks} totalTasks={totalTasks} totalPages={totalPages} />
                </Tab>
                <Tab key="kanban" title="Kanban"></Tab>
                <Tab key="calendar" title="Calendar"></Tab>
            </Tabs>
        </DashboardPageLayout>
    );
}