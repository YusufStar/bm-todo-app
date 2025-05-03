import { TaskStatus } from "@prisma/client";
import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const signUpSchema = z
  .object({
    email: z.string().email(),
    username: z.string().min(3),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .superRefine((data, ctx) => {
    if (data.confirmPassword !== data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export type SignInSchema = z.infer<typeof signInSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;

export const createCompanySchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  website: z.string().optional(),
  logo: z.string().optional(),
});

export type CreateCompanySchema = z.infer<typeof createCompanySchema>;

export enum ProjectStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  STOPPED = "STOPPED",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum CompanyMemberRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export enum ProjectMemberRole {
  ADMIN = "ADMIN",
  PROJECT_ADMIN = "PROJECT_ADMIN",
  DEVELOPER = "DEVELOPER",
  TESTER = "TESTER",
  MARKETING = "MARKETING",
}

export const createProjectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.NOT_STARTED),
  priority: z.nativeEnum(Priority).default(Priority.LOW),
  dueDate: z.date().optional().nullable(),
  budget: z.number().optional().nullable(),
  isPublic: z.boolean().default(false),
  companyId: z.string().uuid(),
});

export const updateProjectSchema = createProjectSchema.partial()
  .extend({
    id: z.string().uuid(),
  });

export const projectQuerySchema = z.object({
  companyId: z.string().uuid(),
  search: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  page: z.number().default(1),
  perPage: z.number().default(10),
  sortBy: z.string().default("createdAt"),
  sortDirection: z.enum(["ascending", "descending"]).default("descending"),
});

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
export type UpdateProjectSchema = z.infer<typeof updateProjectSchema>;
export type ProjectQuerySchema = z.infer<typeof projectQuerySchema>;

export const createTaskSchema = z.object({
  name: z.string().min(3, "Task name must be at least 3 characters"),
  content: z.string().optional(),
  estimatedTime: z.number().optional(),
  spentTime: z.number().optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.NOT_STARTED),
  priority: z.nativeEnum(Priority).default(Priority.LOW),
  dueDate: z.date().optional().nullable(),
  projectId: z.string().uuid(),
  assignee: z.string().uuid().optional(),
});

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;