import { getTasksAction } from "@/actions/project/task_actions";
import ProjectTasksContent from "./_components/ProjectTasksContent";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProjectTasksPage({
    params,
}: {
    params: { projectId: string };
}) {
    const serverParams = await params;
    const { projectId } = serverParams;
    
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        redirect("/login");
    }

    const result = await getTasksAction(projectId, userId);

    if (!result.success) {
        throw new Error(result.error);
    }

    const { data: tasks, totalTasks, totalPages } = result;

    return (
        <ProjectTasksContent 
            projectId={projectId}
            userId={userId}
            tasks={tasks}
            totalTasks={totalTasks}
            totalPages={totalPages}
        />
    );
}
