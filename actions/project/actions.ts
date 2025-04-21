"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { 
  CreateProjectSchema, 
  UpdateProjectSchema, 
  ProjectQuerySchema,
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema
} from "@/types/forms";
import { ActionResult } from "@/types";

// Helper to verify user has access to a company
async function verifyCompanyAccess(companyId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  
  // If user is company owner
  const company = await prisma.company.findFirst({
    where: {
      id: companyId,
      ownerId: session.user.id
    }
  });
  
  if (company) return true;
  
  // If user is company member
  const membership = await prisma.companyMember.findFirst({
    where: {
      companyId,
      userId: session.user.id
    }
  });
  
  return !!membership;
}

// Helper to verify user has access to a project
async function verifyProjectAccess(projectId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  
  // Get the project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { 
      companyId: true,
      isPublic: true
    }
  });
  
  if (!project) return false;
  
  // Check company access first (if you have company access and project is public)
  const hasCompanyAccess = await verifyCompanyAccess(project.companyId);
  
  if (hasCompanyAccess && project.isPublic) {
    return true;
  }
  
  // Check if user is a member of the project specifically
  const projectMembership = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId: session.user.id
    }
  });
  
  return !!projectMembership;
}

export async function getProjectsAction(query: ProjectQuerySchema): Promise<ActionResult<{
  projects: any[];
  totalProjects: number;
  totalPages: number;
}>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate query params
    const validatedQuery = projectQuerySchema.safeParse(query);
    if (!validatedQuery.success) {
      return { success: false, error: "Invalid query parameters" };
    }

    const { 
      companyId, 
      search, 
      status, 
      page, 
      perPage, 
      sortBy, 
      sortDirection 
    } = validatedQuery.data;

    // Convert UI sort direction to Prisma sort direction
    const prismaSortDirection = sortDirection === 'ascending' ? 'asc' : 'desc';

    // Check company access
    const hasAccess = await verifyCompanyAccess(companyId);
    if (!hasAccess) {
      return { success: false, error: "You don't have access to this company" };
    }

    // Build where conditions
    const where: any = { 
      companyId,
      OR: [
        // Projects where user is a member
        {
          members: {
            some: {
              userId: session.user.id
            }
          }
        },
        // OR public projects in the company
        {
          isPublic: true
        }
      ]
    };
    
    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]
        }
      ];
    }

    if (status) {
      where.status = status;
    }

    // Count total projects (for pagination)
    const totalProjects = await prisma.project.count({ where });
    const totalPages = Math.ceil(totalProjects / perPage);

    // Get projects with pagination
    const projects = await prisma.project.findMany({
      where,
      orderBy: {
        [sortBy]: prismaSortDirection,
      },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        _count: {
          select: {
            tasks: true,
            members: true
          }
        }
      }
    });

    // Format data for the client
    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      dueDate: project.dueDate,
      budget: project.budget,
      startDate: project.startDate,
      endDate: project.endDate,
      isPublic: project.isPublic,
      companyId: project.companyId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      tasksCount: project._count.tasks,
      membersCount: project._count.members
    }));

    return { 
      success: true,
      projects: formattedProjects,
      totalProjects,
      totalPages
    } as ActionResult<{
      projects: any[];
      totalProjects: number;
      totalPages: number;
    }>;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return { success: false, error: "Failed to fetch projects" };
  }
}

export async function createProjectAction(data: CreateProjectSchema): Promise<ActionResult<{ project: any }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate input
    const validatedData = createProjectSchema.safeParse(data);
    if (!validatedData.success) {
      return { 
        success: false, 
        error: "Invalid project data", 
        validationErrors: validatedData.error.flatten().fieldErrors 
      };
    }

    // Check company access
    const hasAccess = await verifyCompanyAccess(validatedData.data.companyId);
    if (!hasAccess) {
      return { success: false, error: "You don't have access to this company" };
    }
    
    // Create project
    const project = await prisma.project.create({
      data: {
        ...validatedData.data,
        dueDate: validatedData.data.dueDate ? new Date(validatedData.data.dueDate) : null,
        members: {
          create: {
            userId: session.user.id,
            role: "ADMIN"
          }
        }
      }
    });

    revalidatePath("/dashboard/projects");
    return { 
      success: true, 
      project 
    } as ActionResult<{ project: any }>;
  } catch (error) {
    console.error("Failed to create project:", error);
    return { success: false, error: "Failed to create project" };
  }
}

export async function updateProjectAction(data: UpdateProjectSchema): Promise<ActionResult<{ project: any }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate input
    const validatedData = updateProjectSchema.safeParse(data);
    if (!validatedData.success) {
      return { 
        success: false, 
        error: "Invalid project data",
        validationErrors: validatedData.error.flatten().fieldErrors
      };
    }

    // Check project access
    const hasAccess = await verifyProjectAccess(validatedData.data.id);
    if (!hasAccess) {
      return { success: false, error: "You don't have access to this project" };
    }

    // Prepare data by excluding id and handling dates
    const { id, ...updateData } = validatedData.data;
    
    // Update project
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...updateData,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
      }
    });

    revalidatePath("/dashboard/projects");
    return { 
      success: true, 
      project 
    } as ActionResult<{ project: any }>;
  } catch (error) {
    console.error("Failed to update project:", error);
    return { success: false, error: "Failed to update project" };
  }
}

export async function deleteProjectAction(id: string): Promise<ActionResult<{}>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Check project access with admin rights (we should only allow admins to delete)
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: id,
        userId: session.user.id,
        role: "ADMIN"
      }
    });

    if (!projectMember) {
      return { success: false, error: "You don't have permission to delete this project" };
    }

    // Delete project
    await prisma.project.delete({
      where: { id }
    });

    revalidatePath("/dashboard/projects");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete project:", error);
    return { success: false, error: "Failed to delete project" };
  }
}

export async function getProjectAction(id: string): Promise<ActionResult<{ project: any }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Check project access
    const hasAccess = await verifyProjectAccess(id);
    if (!hasAccess) {
      return { success: false, error: "You don't have access to this project" };
    }

    // Get project details with member and task counts
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tasks: true,
            members: true
          }
        }
      }
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Format project data
    const formattedProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      dueDate: project.dueDate,
      budget: project.budget,
      startDate: project.startDate,
      endDate: project.endDate,
      isPublic: project.isPublic,
      companyId: project.companyId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      tasksCount: project._count.tasks,
      membersCount: project._count.members
    };

    return { 
      success: true, 
      project: formattedProject 
    } as ActionResult<{ project: any }>;
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return { success: false, error: "Failed to fetch project" };
  }
} 