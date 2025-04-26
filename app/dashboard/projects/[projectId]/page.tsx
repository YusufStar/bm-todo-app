import { getProjectAction } from "@/actions/project/actions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProjectContent from "./_components/ProjectContent";

export type Project = {
    id: string;
    name: string;
    description: string;
    status: string;
    priority: string;
    dueDate: Date;
    budget: number;
    startDate: Date | null;
    endDate: Date | null;
    isPublic: boolean;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
    tasksCount: number;
    membersCount: number;
}

export default async function ProjectPage({
    params,
}: {
    params: { projectId: string };
}) {
    const { projectId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const project = await getProjectAction(projectId, session.user.id);
    if (!project.success) {
        redirect("/dashboard/projects");
    }

    const { project: projectData } = project as { project: Project };

    return (
        <ProjectContent project={projectData} />
    );
}
